import Client, { defaultClientManager } from "./src/client";
import query from "./src/query";
import mutation from "./src/mutation";
import compress from "./src/compress";
import GraphQL, { buildQuery, buildMutation } from "./src/gqlComponent";
import Cache from "./src/queryCache";

const { setDefaultClient } = defaultClientManager;
export { Client, query, compress, mutation, setDefaultClient, GraphQL, buildQuery, buildMutation, Cache };
