import { MongoClient } from "mongodb";
import expressGraphql from "express-graphql";
import resolvers from "./graphQL/resolver";
import schema from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";
import express from "express";

const app = express();
const dbPromise = MongoClient.connect("mongodb://localhost:27017/mongotest");
const root = {
  db: dbPromise
};
const executableSchema = makeExecutableSchema({ typeDefs: schema, resolvers });

app.get("/", (req, response) => response.sendfile("./demo/index.htm"));
app.use("/dist/", express.static(__dirname + "/dist/"));

app.use(
  "/graphql",
  expressGraphql({
    schema: executableSchema,
    graphiql: true,
    rootValue: root
  })
);

app.use(
  "/graphql2",
  expressGraphql({
    schema: executableSchema,
    graphiql: true,
    rootValue: root
  })
);

app.use(
  "/graphql3",
  expressGraphql({
    schema: executableSchema,
    graphiql: true,
    rootValue: root
  })
);

app.listen(3000);
