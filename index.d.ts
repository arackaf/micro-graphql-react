import React, { StatelessComponent, ComponentClass, ClassicComponentClass } from "react";
import compress from "./src/compress";
import { buildMutation } from "./src/gqlComponent";

import Cache from "./src/cache";

class Client {
  constructor(options: { endpoint: string; noCaching?: boolean; cacheSize?: number; fetchOptions?: object });
  runQuery(query: string, variables: any = null): Promise<any>;
  getGraphqlQuery({ query: string, variables: any = null }): string;
  processMutation(mutation, variables): Promise<any>;
  runMutation(mutation: string, variables: any = null): Promise<any>;
  getCache(query): Cache;
  newCacheForQuery(query): Cache;
  setCache(query, cache): void;
  subscribeMutation(subscription, options): () => void;
}

export { compress, Client, Cache };
export const setDefaultClient: (client: Client) => void;

type MutationHandlerPayload = {
  currentResults: object;
  cache: Cache;
  softReset: () => void;
  hardReset: () => void;
  refresh: () => void;
};

type MutationHandler = {
  when: string | RegExp;
  run: (variables: object, resp: object, payload: MutationHandlerPayload) => any;
};

type BuildQueryOptions = {
  onMutation?: MutationHandler | MutationHandler[];
  client?: Client;
  cache?: Cache;
};
declare var buildQuery: (queryText: string, variables?: object, options?: BuildQueryOptions) => any;

type IReactComponent<P = any> = StatelessComponent<P> | ComponentClass<P> | ClassicComponentClass<P>;

//options you can pass to the query decorator
export interface QueryOptions {
  client?: Client;
  mapProps?: (props: any) => any;
}

//props that are passed to your decorated query component
export type QueryProps = {
  loading: boolean;
  loaded: boolean;
  data: any;
  error: any;
  reload: () => void;
  clearCache: () => void;
  clearCacheAndReload: () => void;
};

//options you can pass to the mutation decorator
export interface MutationOptions {
  client?: Client;
  mapProps?: (props: any) => any;
}

//props that are passed to your decorated mutation component
export type MutationProps = {
  running: boolean;
  finished: boolean;
  runMutation: (variables: any) => void;
};

//query decorator
export function query(
  queryFn: (componentProps: any) => { query: string; variables: any },
  options?: QueryOptions
): <T extends IReactComponent>(input: T) => T;

//mutation decorator
export function mutation(mutation: string, options?: MutationOptions): <T extends IReactComponent>(input: T) => T;

export declare class GraphQL extends React.Component<{ query?: any; mutation?: any }, any> {}
export { buildQuery, buildMutation };
