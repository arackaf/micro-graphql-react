export default {
  Root: {
    queryPreprocess({ db, root, args, context, ast }) {
      //Called before query filters are processed
    },
    queryMiddleware(queryPacket, { db, root, args, context, ast }) {
      //Called after query filters are processed, which are passed in queryPacket
    },
    queryPreAggregate(aggregateItems, { root, args, context, ast }) {
      //Called right before a Mongo aggregation is performed
    },
    beforeInsert(objToBeInserted, { db, root, args, context, ast, session }) {
      //Called before an insertion occurs. Return false to cancel it
    },
    afterInsert(newObj, { db, root, args, context, ast, session }) {
      //Called after an object is inserted
    },
    beforeUpdate(match, updates, { db, root, args, context, ast, session }) {
      //Called before an update occurs. Return false to cancel it
    },
    afterUpdate(match, updates, { db, root, args, context, ast, session }) {
      //Called after an update occurs. The filter match, and updates objects will be
      //passed into the first two parameters, respectively
    },
    beforeDelete(match, { db, root, args, context, ast, session }) {
      //Called before a deletion. Return false to cancel it.
    },
    afterDelete(match, { db, root, args, context, ast, session }) {
      //Called after a deltion. The filter match will be passed into the first parameter.
    },
    adjustResults(results) {
      //Called anytime objects are returned from a graphQL endpoint. Use this hook to make adjustments to them.
    }
  }
};
