import { queryUtilities, processHook } from "mongo-graphql-starter";
import hooksObj from "../hooks";
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities;
import { ObjectId } from "mongodb";
import Subject from "./Subject";
import * as dbHelpers from "../dbHelpers";

export async function loadSubjects(db, queryPacket) {
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    { $project },
    $sort ? { $sort } : null, 
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item);

  let Subjects = await dbHelpers.runQuery(db, "books", aggregateItems);
  
  await processHook(hooksObj, "Subject", "adjustResults", Subjects);
  return Subjects;
}

export default {
  Query: {
    async getSubject(root, args, context, ast) {
      await processHook(hooksObj, "Subject", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Subject, "Subject");
      await processHook(hooksObj, "Subject", "queryMiddleware", queryPacket, root, args, context, ast);
      let results = await loadSubjects(db, queryPacket);

      return {
        Subject: results[0] || null
      };
    },
    async allSubjects(root, args, context, ast) {
      await processHook(hooksObj, "Subject", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Subject, "Subjects");
      await processHook(hooksObj, "Subject", "queryMiddleware", queryPacket, root, args, context, ast);
      let result = {};

      if (queryPacket.$project) {
        result.Subjects = await loadSubjects(db, queryPacket);
      }

      if (queryPacket.metadataRequested.size) {
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")) {
          let countResults = await dbHelpers.runQuery(db, "books", [{ $match: queryPacket.$match }, { $group: { _id: null, count: { $sum: 1 } } }]);  
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    }
  },
  Mutation: {
    async createSubject(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.Subject, Subject);
      let requestMap = parseRequestedFields(ast, "Subject");
      let $project = getMongoProjection(requestMap, Subject, args);

      if (await processHook(hooksObj, "Subject", "beforeInsert", newObject, root, args, context, ast) === false) {
        return { Subject: null };
      }
      await dbHelpers.runInsert(db, "books", newObject);
      await processHook(hooksObj, "Subject", "afterInsert", newObject, root, args, context, ast);

      let result = (await loadSubjects(db, { $match: { _id: newObject._id }, $project, $limit: 1 }))[0];
      return {
        Subject: result
      }
    },
    async updateSubject(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      let db = await root.db;
      let { $match, $project } = decontructGraphqlQuery({ _id: args._id }, ast, Subject, "Subject");
      let updates = getUpdateObject(args.Updates || {}, Subject);

      if (await processHook(hooksObj, "Subject", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { Subject: null };
      }
      await dbHelpers.runUpdate(db, "books", $match, updates);
      await processHook(hooksObj, "Subject", "afterUpdate", $match, updates, root, args, context, ast);
      
      let result = $project ? (await loadSubjects(db, { $match, $project, $limit: 1 }))[0] : null;
      return {
        Subject: result,
        success: true
      };
    },
    async updateSubjects(root, args, context, ast) {
      let db = await root.db;
      let { $match, $project } = decontructGraphqlQuery({ _id_in: args._ids }, ast, Subject, "Subjects");
      let updates = getUpdateObject(args.Updates || {}, Subject);

      if (await processHook(hooksObj, "Subject", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { success: true };
      }
      await dbHelpers.runUpdate(db, "books", $match, updates, { multi: true });
      await processHook(hooksObj, "Subject", "afterUpdate", $match, updates, root, args, context, ast);
      
      let result = $project ? await loadSubjects(db, { $match, $project }) : null;
      return {
        Subjects: result,
        success: true
      };
    },
    async updateSubjectsBulk(root, args, context, ast) {
      let db = await root.db;
      let { $match } = decontructGraphqlQuery(args.Match, ast, Subject);
      let updates = getUpdateObject(args.Updates || {}, Subject);

      if (await processHook(hooksObj, "Subject", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { success: true };
      }
      await dbHelpers.runUpdate(db, "books", $match, updates, { multi: true });
      await processHook(hooksObj, "Subject", "afterUpdate", $match, updates, root, args, context, ast);

      return { success: true };
    },    
    async deleteSubject(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      
      if (await processHook(hooksObj, "Subject", "beforeDelete", $match, root, args, context, ast) === false) {
        return false;
      }
      await dbHelpers.runDelete(db, "books", $match);
      await processHook(hooksObj, "Subject", "afterDelete", $match, root, args, context, ast);
      return true;
    }
  }
};