import Client, { defaultClientManager } from "./lib/client";
import query from "./lib/query";
import mutation from "./lib/mutation";
import compress from "./lib/compress";
import GraphQL, { buildQuery, buildMutation } from "./lib/gqlComponent";
import Cache from "./lib/cache";

const { setDefaultClient } = defaultClientManager;
export { Client, query, compress, mutation, setDefaultClient, GraphQL, buildQuery, buildMutation, Cache };
