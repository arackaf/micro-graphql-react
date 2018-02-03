import { queryUtilities, processHook } from "mongo-graphql-starter";
import hooksObj from "../hooks";
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities;
import { ObjectId } from "mongodb";
import Book from "./Book";
import * as dbHelpers from "../dbHelpers";

export async function loadBooks(db, queryPacket) {
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    { $project },
    $sort ? { $sort } : null, 
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item);

  let Books = await dbHelpers.runQuery(db, "books", aggregateItems);
  
  await processHook(hooksObj, "Book", "adjustResults", Books);
  return Books;
}

export default {
  Query: {
    async getBook(root, args, context, ast) {
      await processHook(hooksObj, "Book", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Book, "Book");
      await processHook(hooksObj, "Book", "queryMiddleware", queryPacket, root, args, context, ast);
      let results = await loadBooks(db, queryPacket);

      return {
        Book: results[0] || null
      };
    },
    async allBooks(root, args, context, ast) {
      await processHook(hooksObj, "Book", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Book, "Books");
      await processHook(hooksObj, "Book", "queryMiddleware", queryPacket, root, args, context, ast);
      let result = {};

      if (queryPacket.$project) {
        result.Books = await loadBooks(db, queryPacket);
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
    async createBook(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.Book, Book);
      let requestMap = parseRequestedFields(ast, "Book");
      let $project = getMongoProjection(requestMap, Book, args);

      if (await processHook(hooksObj, "Book", "beforeInsert", newObject, root, args, context, ast) === false) {
        return { Book: null };
      }
      await dbHelpers.runInsert(db, "books", newObject);
      await processHook(hooksObj, "Book", "afterInsert", newObject, root, args, context, ast);

      let result = (await loadBooks(db, { $match: { _id: newObject._id }, $project, $limit: 1 }))[0];
      return {
        Book: result
      }
    },
    async updateBook(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      let db = await root.db;
      let { $match, $project } = decontructGraphqlQuery({ _id: args._id }, ast, Book, "Book");
      let updates = getUpdateObject(args.Updates || {}, Book);

      if (await processHook(hooksObj, "Book", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { Book: null };
      }
      await dbHelpers.runUpdate(db, "books", $match, updates);
      await processHook(hooksObj, "Book", "afterUpdate", $match, updates, root, args, context, ast);
      
      let result = $project ? (await loadBooks(db, { $match, $project, $limit: 1 }))[0] : null;
      return {
        Book: result,
        success: true
      };
    },
    async updateBooks(root, args, context, ast) {
      let db = await root.db;
      let { $match, $project } = decontructGraphqlQuery({ _id_in: args._ids }, ast, Book, "Books");
      let updates = getUpdateObject(args.Updates || {}, Book);

      if (await processHook(hooksObj, "Book", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { success: true };
      }
      await dbHelpers.runUpdate(db, "books", $match, updates, { multi: true });
      await processHook(hooksObj, "Book", "afterUpdate", $match, updates, root, args, context, ast);
      
      let result = $project ? await loadBooks(db, { $match, $project }) : null;
      return {
        Books: result,
        success: true
      };
    },
    async updateBooksBulk(root, args, context, ast) {
      let db = await root.db;
      let { $match } = decontructGraphqlQuery(args.Match, ast, Book);
      let updates = getUpdateObject(args.Updates || {}, Book);

      if (await processHook(hooksObj, "Book", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { success: true };
      }
      await dbHelpers.runUpdate(db, "books", $match, updates, { multi: true });
      await processHook(hooksObj, "Book", "afterUpdate", $match, updates, root, args, context, ast);

      return { success: true };
    },    
    async deleteBook(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      
      if (await processHook(hooksObj, "Book", "beforeDelete", $match, root, args, context, ast) === false) {
        return false;
      }
      await dbHelpers.runDelete(db, "books", $match);
      await processHook(hooksObj, "Book", "afterDelete", $match, root, args, context, ast);
      return true;
    }
  }
};