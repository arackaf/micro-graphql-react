import Client, { defaultClientManager } from "./lib/client";
import compress from "./lib/compress";
import GraphQL from "./lib/gqlComponent";
import Cache from "./lib/cache";
import useQuery from "./lib/useQuery";
import useMutation from "./lib/useMutation";
import { buildQuery, buildMutation } from "./lib/util";

const { setDefaultClient, getDefaultClient } = defaultClientManager;

export { Client, compress, setDefaultClient, getDefaultClient, GraphQL, buildQuery, buildMutation, Cache, useQuery, useMutation };
