export default {
  Root: {
    queryPreprocess(root, args, context, ast) {
      //Called before query filters are processed
    },
    queryMiddleware(queryPacket, root, args, context, ast) {
      //Called after query filters are processed, which are passed in queryPacket
    },
    beforeInsert(objToBeInserted, root, args, context, ast) {
      //Called before an insertion occurs. Return false to cancel it
    },
    afterInsert(newObj, root, args, context, ast) {
      //Called after an object is inserted
    },
    beforeUpdate(match, updates, root, args, context, ast) {
      //Called before an update occurs. Return false to cancel it
    },
    afterUpdate(match, updates, root, args, context, ast) {
      //Called after an update occurs. The filter match, and updates objects will be
      //passed into the first two parameters, respectively
    },
    beforeDelete(match, root, args, context, ast) {
      //Called before a deletion. Return false to cancel it.
    },
    afterDelete(match, root, args, context, ast) {
      //Called after a deltion. The filter match will be passed into the first parameter.
    },
    adjustResults(results) {
      //Called anytime objects are returned from a graphQL endpoint. Use this hook to make adjustments to them.
    }
  }
};
