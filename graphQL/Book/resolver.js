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
const runHook = processHook.bind(this, hooksObj, "Book");
const { decontructGraphqlQuery, cleanUpResults, dataLoaderId } = queryUtilities;
const { setUpOneToManyRelationships, newObjectFromArgs } = insertUtilities;
const { getMongoProjection, parseRequestedFields } = projectUtilities;
const { getUpdateObject, setUpOneToManyRelationshipsForUpdate } = updateUtilities;
import { ObjectId } from "mongodb";
import BookMetadata from "./Book";

async function loadBooks(db, aggregationPipeline, root, args, context, ast) {
  await processHook(hooksObj, "Book", "queryPreAggregate", aggregationPipeline, { db, root, args, context, ast });
  let Books = await dbHelpers.runQuery(db, "books", aggregationPipeline);
  await processHook(hooksObj, "Book", "adjustResults", Books);
  Books.forEach(o => {
    if (o._id) {
      o._id = "" + o._id;
    }
  });
  return cleanUpResults(Books, BookMetadata);
}

export const Book = {};

export default {
  Query: {
    async getBook(root, args, context, ast) {
      let db = await (typeof root.db === "function" ? root.db() : root.db);
      await runHook("queryPreprocess", { db, root, args, context, ast });
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, BookMetadata, "Book");
      let { aggregationPipeline } = queryPacket;
      await runHook("queryMiddleware", queryPacket, { db, root, args, context, ast });
      let results = await loadBooks(db, aggregationPipeline, root, args, context, ast, "Book");

      return {
        Book: results[0] || null
      };
    },
    async allBooks(root, args, context, ast) {
      let db = await (typeof root.db === "function" ? root.db() : root.db);
      await runHook("queryPreprocess", { db, root, args, context, ast });
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, BookMetadata, "Books");
      let { aggregationPipeline } = queryPacket;
      await runHook("queryMiddleware", queryPacket, { db, root, args, context, ast });
      let result = {};

      if (queryPacket.$project) {
        result.Books = await loadBooks(db, aggregationPipeline, root, args, context, ast);
      }

      if (queryPacket.metadataRequested.size) {
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")) {
          let $match = aggregationPipeline.find(item => item.$match);
          let countResults = await dbHelpers.runQuery(db, "books", [
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
    async createBook(root, args, context, ast) {
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Book", BookMetadata, {
        create: true
      });
      return await resolverHelpers.runMutation(session, transaction, async () => {
        let newObject = await newObjectFromArgs(args.Book, BookMetadata, { ...gqlPacket, db, session });
        let requestMap = parseRequestedFields(ast, "Book");
        let $project = requestMap.size ? getMongoProjection(requestMap, BookMetadata, args) : null;

        newObject = await dbHelpers.processInsertion(db, newObject, {
          ...gqlPacket,
          typeMetadata: BookMetadata,
          session
        });
        if (newObject == null) {
          return { Book: null, success: false };
        }
        await setUpOneToManyRelationships(newObject, args.Book, BookMetadata, { ...gqlPacket, db, session });
        await resolverHelpers.mutationComplete(session, transaction);

        let result = $project
          ? (
              await loadBooks(
                db,
                [{ $match: { _id: newObject._id } }, { $project }, { $limit: 1 }],
                root,
                args,
                context,
                ast
              )
            )[0]
          : null;
        return resolverHelpers.mutationSuccessResult({ Book: result, transaction, elapsedTime: 0 });
      });
    },
    async updateBook(root, args, context, ast) {
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Book", BookMetadata, {
        update: true
      });
      return await resolverHelpers.runMutation(session, transaction, async () => {
        let { $match, $project } = decontructGraphqlQuery(args._id ? { _id: args._id } : {}, ast, BookMetadata, "Book");
        let updates = await getUpdateObject(args.Updates || {}, BookMetadata, { ...gqlPacket, db, session });

        if ((await runHook("beforeUpdate", $match, updates, { ...gqlPacket, db, session })) === false) {
          return resolverHelpers.mutationCancelled({ transaction });
        }
        if (!$match._id) {
          throw "No _id sent, or inserted in middleware";
        }
        await setUpOneToManyRelationshipsForUpdate([args._id], args, BookMetadata, { ...gqlPacket, db, session });
        await dbHelpers.runUpdate(db, "books", $match, updates, { session });
        await runHook("afterUpdate", $match, updates, { ...gqlPacket, db, session });
        await resolverHelpers.mutationComplete(session, transaction);

        let result = $project
          ? (await loadBooks(db, [{ $match }, { $project }, { $limit: 1 }], root, args, context, ast))[0]
          : null;
        return resolverHelpers.mutationSuccessResult({ Book: result, transaction, elapsedTime: 0 });
      });
    },
    async updateBooks(root, args, context, ast) {
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Book", BookMetadata, {
        update: true
      });
      return await resolverHelpers.runMutation(session, transaction, async () => {
        let { $match, $project } = decontructGraphqlQuery({ _id_in: args._ids }, ast, BookMetadata, "Books");
        let updates = await getUpdateObject(args.Updates || {}, BookMetadata, { ...gqlPacket, db, session });

        if ((await runHook("beforeUpdate", $match, updates, { ...gqlPacket, db, session })) === false) {
          return resolverHelpers.mutationCancelled({ transaction });
        }
        await setUpOneToManyRelationshipsForUpdate(args._ids, args, BookMetadata, { ...gqlPacket, db, session });
        await dbHelpers.runUpdate(db, "books", $match, updates, { session });
        await runHook("afterUpdate", $match, updates, { ...gqlPacket, db, session });
        await resolverHelpers.mutationComplete(session, transaction);

        let result = $project ? await loadBooks(db, [{ $match }, { $project }], root, args, context, ast) : null;
        return resolverHelpers.mutationSuccessResult({ Books: result, transaction, elapsedTime: 0 });
      });
    },
    async updateBooksBulk(root, args, context, ast) {
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Book", BookMetadata, {
        update: true
      });
      return await resolverHelpers.runMutation(session, transaction, async () => {
        let { $match } = decontructGraphqlQuery(args.Match, ast, BookMetadata);
        let updates = await getUpdateObject(args.Updates || {}, BookMetadata, { ...gqlPacket, db, session });

        if ((await runHook("beforeUpdate", $match, updates, { ...gqlPacket, db, session })) === false) {
          return resolverHelpers.mutationCancelled({ transaction });
        }
        await dbHelpers.runUpdate(db, "books", $match, updates, { session });
        await runHook("afterUpdate", $match, updates, { ...gqlPacket, db, session });

        return await resolverHelpers.finishSuccessfulMutation(session, transaction);
      });
    },
    async deleteBook(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Book", BookMetadata, {
        delete: true
      });
      try {
        let $match = { _id: ObjectId(args._id) };

        if ((await runHook("beforeDelete", $match, { ...gqlPacket, db, session })) === false) {
          return { success: false };
        }
        await dbHelpers.runDelete(db, "books", $match);
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
