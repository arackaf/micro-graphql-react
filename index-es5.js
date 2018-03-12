import Client, { defaultClientManager } from "./lib-es5/client";
import query from "./lib-es5/query";
import mutation from "./lib-es5/mutation";
import compress from "./lib-es5/compress";

const { setDefaultClient } = defaultClientManager;
export { Client, query, compress, mutation, setDefaultClient };
