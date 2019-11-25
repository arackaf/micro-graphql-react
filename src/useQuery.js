import React from "react";
const { useState, useRef, useLayoutEffect } = React;

import { defaultClientManager } from "./client";
import QueryManager from "./queryManager";

export default function useQuery(packet) {
  let [query, variables, options = {}] = packet;
  let client = options.client || defaultClientManager.getDefaultClient();

  let [queryState, setQueryState] = useState(QueryManager.initialState);
  let [queryManager] = useState(() => {
    let result = new QueryManager({ client, cache: options.cache, setState: setQueryState }, packet);
    if (!("active" in options && !options.active)) {
      result.load(packet);
    }
    return result;
  });

  let currentQuery = useRef(queryManager.currentUri);
  let nextQuery = queryManager.client.getGraphqlQuery({ query, variables });
  let isActive = !("active" in options && !options.active);

  useLayoutEffect(() => {
    if (nextQuery != currentQuery.current) {
      if (isActive) {
        currentQuery.current = nextQuery;
        queryManager.load(packet);
      }
    }
  }, [nextQuery, isActive]);

  useLayoutEffect(() => () => queryManager && queryManager.dispose(), []);

  return queryManager.currentState;
}
