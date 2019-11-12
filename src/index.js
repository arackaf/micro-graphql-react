import Client, { defaultClientManager } from "./client";
import compress from "./compress";
import GraphQL from "./gqlComponent";
import Cache from "./cache";
import useQuery from "./useQuery";
import useSuspenseQuery from "./useSuspenseQuery";
import useMutation from "./useMutation";
import { buildQuery, buildMutation } from "./util";

const { setDefaultClient, getDefaultClient } = defaultClientManager;

export { Client, compress, setDefaultClient, getDefaultClient, GraphQL, buildQuery, buildMutation, Cache, useQuery, useSuspenseQuery, useMutation };
