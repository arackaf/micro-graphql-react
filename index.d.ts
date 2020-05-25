import React, { StatelessComponent, ComponentClass, ClassicComponentClass, Children } from "react";

type MutationSubscription = {
  when: string | RegExp;
  run: (payload: MutationHandlerPayload, resp: any, variables: any) => any;
};

type MutationHandlerPayload = {
  currentResults: any;
  cache: Cache;
  softReset: (newResults: any) => void;
  hardReset: () => void;
  refresh: () => void;
};

type QueryPacket = [string, any, any];
type MutationPacket = [string, any];

export type QueryPayload<TResults = any> = {
  loading: boolean;
  loaded: boolean;
  data: TResults;
  error: any;
  currentQuery: string;
  reload: () => void;
  clearCache: () => void;
  clearCacheAndReload: () => void;
};

export type MutationPayload<TResults = any> = {
  running: boolean;
  finished: boolean;
  runMutation: (variables: any) => Promise<TResults>;
};

export class Cache {
  constructor(cacheSize?: number);
  entries: [string, any][];
  get(key: string): any;
  set(key: string, results: any): void;
  delete(key: string): void;
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
  subscribeMutation(subscription: any, options?: any): () => void;
  forceUpdate(query: string): void;
  preload(query: string, variables: any): void;
}

type BuildQueryOptions = {
  onMutation?: MutationSubscription | MutationSubscription[];
  client?: Client;
  cache?: Cache;
  active?: boolean;
  preloadOnly: boolean;
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

export function useQuery<TResults = any>(queryPacket: QueryPacket): QueryPayload<TResults>;
export function useSuspenseQuery<TResults = any>(queryPacket: QueryPacket): QueryPayload<TResults>;

export function useMutation<TResults = any>(mutationPacket: MutationPacket): MutationPayload<TResults>;

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
