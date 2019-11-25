import React from "react";
const { useState, useRef, useLayoutEffect } = React;

import { defaultClientManager } from "./client";
import QueryManager from "./queryManager";

export default function useQuery(packet) {
  let [query, variables, options = {}] = packet;
  let client = options.client || defaultClientManager.getDefaultClient();

  let isActive = !("active" in options && !options.active);
  let [queryManager] = useState(() => {
    let result = new QueryManager({ client, cache: options.cache }, packet);
    if (isActive) {
      result.load(packet);
    }
    return result;
  });
  let nextQuery = queryManager.client.getGraphqlQuery({ query, variables });

  let [queryState, setQueryState] = useState(queryManager.currentState);
  queryManager.setState = setQueryState;

  useLayoutEffect(() => {
    if (isActive) {
      queryManager.load(packet);
    }
  }, [nextQuery, isActive]);

  useLayoutEffect(() => () => queryManager && queryManager.dispose(), []);

  return queryState;
}
