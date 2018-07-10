import Client, { defaultClientManager } from "./lib-es5/client";
import query from "./lib-es5/query";
import mutation from "./lib-es5/mutation";
import compress from "./lib-es5/compress";
import GraphQL, { buildQuery, buildMutation } from "./lib-es5/gqlComponent";

const { setDefaultClient } = defaultClientManager;
export { Client, query, compress, mutation, setDefaultClient, GraphQL, buildQuery, buildMutation };
