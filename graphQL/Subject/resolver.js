import {
  insertUtilities,
  queryUtilities,
  projectUtilities,
  updateUtilities,
  processHook,
  dbHelpers,
  resolverHelpers
} from "mongo-graphql-starter";
import hooksObj from "../hooks";
const runHook = processHook.bind(this, hooksObj, "Subject");
const { decontructGraphqlQuery, cleanUpResults, dataLoaderId } = queryUtilities;
const { setUpOneToManyRelationships, newObjectFromArgs } = insertUtilities;
const { getMongoProjection, parseRequestedFields } = projectUtilities;
const { getUpdateObject, setUpOneToManyRelationshipsForUpdate } = updateUtilities;
import { ObjectId } from "mongodb";
import SubjectMetadata from "./Subject";

async function loadSubjects(db, aggregationPipeline, root, args, context, ast) {
  await processHook(hooksObj, "Subject", "queryPreAggregate", aggregationPipeline, { db, root, args, context, ast });
  let Subjects = await dbHelpers.runQuery(db, "subjects", aggregationPipeline);
  await processHook(hooksObj, "Subject", "adjustResults", Subjects);
  Subjects.forEach(o => {
    if (o._id) {
      o._id = "" + o._id;
    }
  });
  return cleanUpResults(Subjects, SubjectMetadata);
}

export const Subject = {};

export default {
  Query: {
    async getSubject(root, args, context, ast) {
      let db = await (typeof root.db === "function" ? root.db() : root.db);
      await runHook("queryPreprocess", { db, root, args, context, ast });
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, SubjectMetadata, "Subject");
      let { aggregationPipeline } = queryPacket;
      await runHook("queryMiddleware", queryPacket, { db, root, args, context, ast });
      let results = await loadSubjects(db, aggregationPipeline, root, args, context, ast, "Subject");

      return {
        Subject: results[0] || null
      };
    },
    async allSubjects(root, args, context, ast) {
      let db = await (typeof root.db === "function" ? root.db() : root.db);
      await runHook("queryPreprocess", { db, root, args, context, ast });
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, SubjectMetadata, "Subjects");
      let { aggregationPipeline } = queryPacket;
      await runHook("queryMiddleware", queryPacket, { db, root, args, context, ast });
      let result = {};

      if (queryPacket.$project) {
        result.Subjects = await loadSubjects(db, aggregationPipeline, root, args, context, ast);
      }

      if (queryPacket.metadataRequested.size) {
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")) {
          let $match = aggregationPipeline.find(item => item.$match);
          let countResults = await dbHelpers.runQuery(db, "subjects", [
            $match,
            { $group: { _id: null, count: { $sum: 1 } } }
          ]);
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    }
  },
  Mutation: {
    async createSubject(root, args, context, ast) {
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Subject", SubjectMetadata, {
        create: true
      });
      return await resolverHelpers.runMutation(session, transaction, async () => {
        let newObject = await newObjectFromArgs(args.Subject, SubjectMetadata, { ...gqlPacket, db, session });
        let requestMap = parseRequestedFields(ast, "Subject");
        let $project = requestMap.size ? getMongoProjection(requestMap, SubjectMetadata, args) : null;

        newObject = await dbHelpers.processInsertion(db, newObject, {
          ...gqlPacket,
          typeMetadata: SubjectMetadata,
          session
        });
        if (newObject == null) {
          return { Subject: null, success: false };
        }
        await setUpOneToManyRelationships(newObject, args.Subject, SubjectMetadata, { ...gqlPacket, db, session });
        await resolverHelpers.mutationComplete(session, transaction);

        let result = $project
          ? (
              await loadSubjects(
                db,
                [{ $match: { _id: newObject._id } }, { $project }, { $limit: 1 }],
                root,
                args,
                context,
                ast
              )
            )[0]
          : null;
        return resolverHelpers.mutationSuccessResult({ Subject: result, transaction, elapsedTime: 0 });
      });
    },
    async updateSubject(root, args, context, ast) {
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Subject", SubjectMetadata, {
        update: true
      });
      return await resolverHelpers.runMutation(session, transaction, async () => {
        let { $match, $project } = decontructGraphqlQuery(
          args._id ? { _id: args._id } : {},
          ast,
          SubjectMetadata,
          "Subject"
        );
        let updates = await getUpdateObject(args.Updates || {}, SubjectMetadata, { ...gqlPacket, db, session });

        if ((await runHook("beforeUpdate", $match, updates, { ...gqlPacket, db, session })) === false) {
          return resolverHelpers.mutationCancelled({ transaction });
        }
        if (!$match._id) {
          throw "No _id sent, or inserted in middleware";
        }
        await setUpOneToManyRelationshipsForUpdate([args._id], args, SubjectMetadata, { ...gqlPacket, db, session });
        await dbHelpers.runUpdate(db, "subjects", $match, updates, { session });
        await runHook("afterUpdate", $match, updates, { ...gqlPacket, db, session });
        await resolverHelpers.mutationComplete(session, transaction);

        let result = $project
          ? (await loadSubjects(db, [{ $match }, { $project }, { $limit: 1 }], root, args, context, ast))[0]
          : null;
        return resolverHelpers.mutationSuccessResult({ Subject: result, transaction, elapsedTime: 0 });
      });
    },
    async updateSubjects(root, args, context, ast) {
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Subject", SubjectMetadata, {
        update: true
      });
      return await resolverHelpers.runMutation(session, transaction, async () => {
        let { $match, $project } = decontructGraphqlQuery({ _id_in: args._ids }, ast, SubjectMetadata, "Subjects");
        let updates = await getUpdateObject(args.Updates || {}, SubjectMetadata, { ...gqlPacket, db, session });

        if ((await runHook("beforeUpdate", $match, updates, { ...gqlPacket, db, session })) === false) {
          return resolverHelpers.mutationCancelled({ transaction });
        }
        await setUpOneToManyRelationshipsForUpdate(args._ids, args, SubjectMetadata, { ...gqlPacket, db, session });
        await dbHelpers.runUpdate(db, "subjects", $match, updates, { session });
        await runHook("afterUpdate", $match, updates, { ...gqlPacket, db, session });
        await resolverHelpers.mutationComplete(session, transaction);

        let result = $project ? await loadSubjects(db, [{ $match }, { $project }], root, args, context, ast) : null;
        return resolverHelpers.mutationSuccessResult({ Subjects: result, transaction, elapsedTime: 0 });
      });
    },
    async updateSubjectsBulk(root, args, context, ast) {
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Subject", SubjectMetadata, {
        update: true
      });
      return await resolverHelpers.runMutation(session, transaction, async () => {
        let { $match } = decontructGraphqlQuery(args.Match, ast, SubjectMetadata);
        let updates = await getUpdateObject(args.Updates || {}, SubjectMetadata, { ...gqlPacket, db, session });

        if ((await runHook("beforeUpdate", $match, updates, { ...gqlPacket, db, session })) === false) {
          return resolverHelpers.mutationCancelled({ transaction });
        }
        await dbHelpers.runUpdate(db, "subjects", $match, updates, { session });
        await runHook("afterUpdate", $match, updates, { ...gqlPacket, db, session });

        return await resolverHelpers.finishSuccessfulMutation(session, transaction);
      });
    },
    async deleteSubject(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Subject", SubjectMetadata, {
        delete: true
      });
      try {
        let $match = { _id: ObjectId(args._id) };

        if ((await runHook("beforeDelete", $match, { ...gqlPacket, db, session })) === false) {
          return { success: false };
        }
        await dbHelpers.runDelete(db, "subjects", $match);
        await runHook("afterDelete", $match, { ...gqlPacket, db, session });
        return await resolverHelpers.finishSuccessfulMutation(session, transaction);
      } catch (err) {
        await resolverHelpers.mutationError(err, session, transaction);
        return { success: false };
      } finally {
        resolverHelpers.mutationOver(session);
      }
    }
  }
};
