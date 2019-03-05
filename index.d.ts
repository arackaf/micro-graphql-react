import React, { StatelessComponent, ComponentClass, ClassicComponentClass, Children } from "react";

type MutationSubscription = {
  when: string | RegExp;
  run: (payload: MutationHandlerPayload, resp: any, variables: any) => any;
};

type MutationHandlerPayload = {
  currentResults: any;
  cache: Cache;
  softReset: () => void;
  hardReset: () => void;
  refresh: () => void;
};

type QueryPacket = [string, any, any];
type MutationPacket = [string, any];

export type QueryPayload = {
  loading: boolean;
  loaded: boolean;
  data: any;
  error: any;
  currentQuery: string;
  reload: () => void;
  clearCache: () => void;
  clearCacheAndReload: () => void;
};

export type MutationPayload = {
  running: boolean;
  finished: boolean;
  runMutation: (variables: any) => Promise<any>;
};

export class Cache {
  constructor(cacheSize?: number);
  entries: [string, any][];
  get(key): any;
  set(key, results): void;
  delete(key): void;
  clearCache(): void;
}

export class Client {
  constructor(options: { endpoint: string; noCaching?: boolean; cacheSize?: number; fetchOptions?: any });
  runQuery(query: string, variables?: any): Promise<any>;
  getGraphqlQuery({ query, variables }: { query: string; variables: any }): string;
  processMutation(mutation: string, variables?: any): Promise<any>;
  runMutation(mutation: string, variables?: any): Promise<any>;
  getCache(query: string): Cache;
  newCacheForQuery(query: string): Cache;
  setCache(query: string, cache: Cache): void;
  subscribeMutation(subscription, options?): () => void;
  forceUpdate(query): void;
}

type BuildQueryOptions = {
  onMutation?: MutationSubscription | MutationSubscription[];
  client?: Client;
  cache?: Cache;
  active?: boolean;
};

type BuildMutationOptions = {
  client?: Client;
};

export const buildQuery: (queryText: string, variables?: any, options?: BuildQueryOptions) => QueryPacket;
export const buildMutation: (mutationText: string, options?: BuildQueryOptions) => MutationPacket;

type IReactComponent<P = any> = StatelessComponent<P> | ComponentClass<P> | ClassicComponentClass<P>;

export const compress: any;
export const setDefaultClient: (client: Client) => void;
export const getDefaultClient: () => Client;

export function useQuery(queryPacket: QueryPacket): QueryPayload;

export function useMutation(mutationPacket: MutationPacket): MutationPayload;

type RenderProps<Query, Mutation> = Record<keyof Query, QueryPayload> & Record<keyof Mutation, MutationPayload>;

type QueryMap = { [s: string]: QueryPacket };
type MutationMap = { [s: string]: MutationPacket };

type ComponentPacket<Query extends QueryMap, Mutation extends MutationMap> = {
  query?: Query;
  mutation?: Mutation;
  children(fn: RenderProps<Query, Mutation>): React.ReactNode;
};

export function GraphQL<QueryType extends QueryMap = {}, MutationType extends MutationMap = {}>(
  props: ComponentPacket<QueryType, MutationType>
): JSX.Element;
