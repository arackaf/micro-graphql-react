import Client, { defaultClientManager } from "./lib/client";
import query from "./lib/query";
import mutation from "./lib/mutation";

const { setDefaultClient } = defaultClientManager;
export { Client, query, mutation, setDefaultClient };
