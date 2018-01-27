import { MongoError } from "mongodb";

export async function runUpdate(db, table, $match, updates, options) {
  if (updates.$set || updates.$inc || updates.$push || updates.$pull || updates.$addToSet) {
    try {
      await db.collection(table).update($match, updates, options);
    } catch (err) {
      if (err instanceof MongoError) {
        throw `The following error was thrown by Mongo when attempting to perform this update: ${err.toString()}`;
      } else {
        throw err;
      }
    }
  }
}

export async function runDelete(db, table, $match) {
  try {
    await db.collection(table).remove($match);
  } catch (err) {
    if (err instanceof MongoError) {
      throw `The following error was thrown by Mongo when attempting to perform this deletion: ${err.toString()}`;
    } else {
      throw err;
    }
  }
}

export async function runInsert(db, table, newObject) {
  try {
    await db.collection(table).insert(newObject);
  } catch (err) {
    if (err instanceof MongoError) {
      throw `The following error was thrown by Mongo when attempting to perform this insertion: ${err.toString()}`;
    } else {
      throw err;
    }
  }
}

export async function runQuery(db, table, aggregateItems) {
  try {
    return await db
      .collection(table)
      .aggregate(aggregateItems)
      .toArray();
  } catch (err) {
    if (err instanceof MongoError) {
      throw `The following error was thrown by Mongo when attempting to perform this query: ${err.toString()}`;
    } else {
      throw err;
    }
  }
}
