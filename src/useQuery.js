import React from "react";
const { useState, useRef, useLayoutEffect } = React;

import { defaultClientManager } from "./client";
import QueryManager from "./queryManager";

export default function useQuery(query, variables, options = {}, { suspense } = {}) {
  let currentActive = useRef(null);
  let currentQuery = useRef(null);

  let isActive = !("active" in options && !options.active);
  let [queryManager] = useState(
    () => new QueryManager({ ...options, query, variables, options, isActive, suspense, preloadOnly: options.preloadOnly })
  );
  let nextQuery = queryManager.client.getGraphqlQuery({ query, variables });

  let [queryState, setQueryState] = useState(queryManager.currentState);
  queryManager.setState = setQueryState;

  if (currentActive.current != isActive || currentQuery.current != nextQuery) {
    currentActive.current = isActive;
    currentQuery.current = nextQuery;
    queryManager.sync({ query, variables, isActive });
  }

  useLayoutEffect(() => {
    queryManager.init();
    return () => queryManager.dispose();
  }, []);

  return queryManager.currentState;
}

export const useSuspenseQuery = (query, variables, options = {}) => useQuery(query, variables, options, { suspense: true });
