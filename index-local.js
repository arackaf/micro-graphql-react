import Client, { defaultClientManager } from "./src/client";
import compress from "./src/compress";
import GraphQL from "./src/gqlComponent";
import Cache from "./src/cache";
import useQuery from "./src/useQuery";
import useMutation from "./src/useMutation";
import { buildQuery, buildMutation } from "./src/util";

const { setDefaultClient } = defaultClientManager;

export { Client, compress, setDefaultClient, GraphQL, buildQuery, buildMutation, Cache, useQuery, useMutation };
