import React, { StatelessComponent, ComponentClass, ClassicComponentClass } from "react";

type IReactComponent<P = any> = StatelessComponent<P> | ComponentClass<P> | ClassicComponentClass<P>;

export type QueryProps = {
  loading: boolean;
  loaded: boolean;
  data: any;
  error: any;
  reload: () => void;
  clearCache: () => void;
  clearCacheAndReload: () => void;
};

export type MutationProps = {
  running: boolean;
  finished: boolean;
  runMutation: (variables: any) => void;
};

//TODO: type packet
export function query(queryFn: (componentProps: any) => { query: string; variables: any }, packet: any): <T extends IReactComponent>(input: T) => T;
export function mutation(mutation: string, packet: any): <T extends IReactComponent>(input: T) => T;
