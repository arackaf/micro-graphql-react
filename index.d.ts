import React, { StatelessComponent, ComponentClass, ClassicComponentClass } from "react";

type IReactComponent<P = any> = StatelessComponent<P> | ComponentClass<P> | ClassicComponentClass<P>;

type QueryType = {
  loading?: boolean;
  loaded?: boolean;
};

export function foo(input: { x: number }): <T extends IReactComponent>(input: T) => T {
  return null;
}
