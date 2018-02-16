import Client, { defaultClientManager } from "./src/client";
import query from "./src/query";
import mutation from "./src/mutation";

const { setDefaultClient } = defaultClientManager;
export { Client, query, mutation, setDefaultClient };
