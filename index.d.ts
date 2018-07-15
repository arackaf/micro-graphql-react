import React, { StatelessComponent, ComponentClass, ClassicComponentClass } from "react";
import compress from "./src/compress";
import { buildQuery, buildMutation } from "./src/gqlComponent";

type IReactComponent<P = any> = StatelessComponent<P> | ComponentClass<P> | ClassicComponentClass<P>;

class Client {
  constructor(options: any);
  runQuery(query: string, variables: any = null): any;
  getGraphqlQuery({ query: string, variables: any = null }): any;
  runMutation(mutation: string, variables: any = null): any;
}
declare function setDefaultClient(client: Client): void;

export { compress, Client, setDefaultClient };

declare var Cache: any;

export { Cache };

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
