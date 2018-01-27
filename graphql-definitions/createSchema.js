import { createGraphqlSchema } from "mongo-graphql-starter";
import projectSetup from "./projectSetup";

import path from "path";
import del from "del";

del.sync(path.resolve("../graphQL"), { force: true });

createGraphqlSchema(projectSetup, path.resolve("../"));
