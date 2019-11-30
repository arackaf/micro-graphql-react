import React from "react";
const { useState, useRef, useLayoutEffect } = React;

import { defaultClientManager } from "./client";
import QueryManager from "./queryManager";

export default function useQuery(packet) {
  let [query, variables, options = {}] = packet;

  let isActive = !("active" in options && !options.active);
  let [queryManager] = useState(() => new QueryManager({ ...options, packet, isActive }));
  let nextQuery = queryManager.client.getGraphqlQuery({ query, variables });

  let [queryState, setQueryState] = useState(queryManager.currentState);
  queryManager.setState = setQueryState;

  useLayoutEffect(() => {
    queryManager.sync({ packet, isActive });
  }, [nextQuery, isActive]);

  useLayoutEffect(() => {
    queryManager.init();
    return () => queryManager && queryManager.dispose();
  }, []);

  return queryManager.currentState;
}
