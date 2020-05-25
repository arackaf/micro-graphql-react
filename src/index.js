import Client, { defaultClientManager } from "./client";
import compress from "./compress";
import Cache from "./cache";
import useQuery, { useSuspenseQuery } from "./useQuery";
import useMutation from "./useMutation";

const { setDefaultClient, getDefaultClient } = defaultClientManager;

export { Client, compress, setDefaultClient, getDefaultClient, Cache, useQuery, useSuspenseQuery, useMutation };
