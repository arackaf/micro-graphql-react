import Client, { defaultClientManager } from "./lib/client";
import query from "./lib/query";
import mutation from "./lib/mutation";
import compress from "./lib/compress";

const { setDefaultClient } = defaultClientManager;
export { Client, query, compress, mutation, setDefaultClient };
