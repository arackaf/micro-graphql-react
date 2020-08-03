import React from "react";
const { useState, useRef, useLayoutEffect } = React;

import { defaultClientManager } from "./client";
import QueryManager from "./queryManager";

export default function useQuery(query, variables, options = {}, { suspense } = {}) {
  let [deactivateQueryToken, setDeactivateQueryToken] = useState(0);
  let refreshCurrent = () => {
    setDeactivateQueryToken(x => x + 1);
  };

  let isActive = !("active" in options && !options.active);
  let [queryManager] = useState(
    () =>
      new QueryManager({
        ...options,
        refreshCurrent,
        query,
        variables,
        options,
        isActive,
        suspense,
        preloadOnly: options.preloadOnly
      })
  );

  let [queryState, setQueryState] = useState(queryManager.currentState);
  queryManager.setState = setQueryState;
  queryManager.getState = () => queryState;

  queryManager.sync({ query, variables, isActive });

  useLayoutEffect(() => {
    queryManager.init();
    return () => queryManager.dispose();
  }, []);

  return queryState;
}

export const useSuspenseQuery = (query, variables, options = {}) => useQuery(query, variables, options, { suspense: true });
