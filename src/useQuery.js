import React from "react";
const { useState, useRef, useMemo } = React;

import { defaultClientManager } from "./client";
import QueryManager from "./queryManager";

export default function useQuery(packet) {
  let [query, variables, options = {}] = packet;
  let client = options.client || defaultClientManager.getDefaultClient();
  let isInitial = useRef(true);

  let [queryState, setQueryState] = useState(QueryManager.initialState);
  let queryManager = useMemo(() => {
    let queryManager = new QueryManager({ client, cache: options.cache, setState: setQueryState }, packet);
    queryManager.load();
    return queryManager;
  }, []);

  if (!isInitial.current) {
    queryManager.updateIfNeeded(packet);
  } else {
    isInitial.current = false;
  }
  return queryState;
}
