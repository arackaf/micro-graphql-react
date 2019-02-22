import Client, { defaultClientManager } from "./lib-es5/client";
import compress from "./lib-es5/compress";
import GraphQL from "./lib-es5/gqlComponent";
import Cache from "./lib-es5/cache";
import useQuery from "./lib-es5/useQuery";
import useMutation from "./lib-es5/useMutation";
import { buildQuery, buildMutation } from "./lib-es5/util";

const { setDefaultClient, getDefaultClient } = defaultClientManager;

export { Client, compress, setDefaultClient, getDefaultClient, GraphQL, buildQuery, buildMutation, Cache, useQuery, useMutation };
