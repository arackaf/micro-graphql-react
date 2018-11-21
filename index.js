import Client, { defaultClientManager } from "./lib/client";
import compress from "./lib/compress";
import GraphQL from "./lib/gqlComponent";
import Cache from "./lib/cache";
import useQuery from "./lib/useQuery";
import useMutation from "./lib/useMutation";
import { buildQuery, buildMutation } from "./lib/util";

const { setDefaultClient } = defaultClientManager;

export { Client, compress, setDefaultClient, GraphQL, buildQuery, buildMutation, Cache, useQuery, useMutation };
