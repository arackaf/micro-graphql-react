import React from "react";
const { useState, useRef, useLayoutEffect } = React;

import { defaultClientManager } from "./client";
import QueryManager from "./queryManager";

export default function useQuery(packet, { suspense } = {}) {
  let currentActive = useRef(null);
  let currentQuery = useRef(null);
  let [query, variables, options = {}] = packet;

  let isActive = !("active" in options && !options.active);
  let [queryManager] = useState(() => new QueryManager({ ...options, packet, isActive }));
  let nextQuery = queryManager.client.getGraphqlQuery({ query, variables });

  let [queryState, setQueryState] = useState(queryManager.currentState);
  queryManager.setState = setQueryState;

  if (currentActive.current != isActive || currentQuery.current != nextQuery) {
    currentActive.current = isActive;
    currentQuery.current = nextQuery;
    queryManager.sync({ packet, isActive, suspense });
  }

  useLayoutEffect(() => {
    queryManager.init();
    return () => queryManager.dispose();
  }, []);

  return queryManager.currentState;
}

export const useSuspenseQuery = packet => useQuery(packet, { suspense: true });
