import React from "react";
const { useState, useRef, useLayoutEffect } = React;

import { defaultClientManager } from "./client";
import QueryManager from "./queryManager";

export default function useQuery(packet) {
  let [query, variables, options = {}] = packet;
  let client = options.client || defaultClientManager.getDefaultClient();

  let [queryState, setQueryState] = useState(QueryManager.initialState);
  let [queryManager] = useState(() => new QueryManager({ client, cache: options.cache }, packet));

  let currentQuery = useRef(null);
  let initialRender = useRef(true);
  let nextQuery = queryManager.client.getGraphqlQuery({ query, variables });
  let isActive = !("active" in options && !options.active);

  if (initialRender.current) {
    initialRender.current = false;
    queryManager.setState = setQueryState;
    if (isActive) {
      queryManager.load(packet);
      currentQuery.current = nextQuery;
    }
  }

  useLayoutEffect(() => {
    if (nextQuery != currentQuery.current) {
      if (isActive) {
        queryManager.load(packet);
        currentQuery.current = nextQuery;
      }
    }
  }, [nextQuery, isActive]);

  useLayoutEffect(() => () => queryManager && queryManager.dispose(), []);

  return queryManager.currentState;
}
