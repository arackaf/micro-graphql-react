import Client, { defaultClientManager } from "./client";
import compress from "./compress";
import Cache from "./cache";
import useQuery, { useSuspenseQuery } from "./useQuery";
import useMutation from "./useMutation";
import { buildQuery, buildMutation } from "./util";

const { setDefaultClient, getDefaultClient } = defaultClientManager;

export { Client, compress, setDefaultClient, getDefaultClient, buildQuery, buildMutation, Cache, useQuery, useSuspenseQuery, useMutation };
