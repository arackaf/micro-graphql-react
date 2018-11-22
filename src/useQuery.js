import React from "react";
const { useState, useRef, useMemo, useEffect } = React;

import { defaultClientManager } from "./client";
import QueryManager from "./queryManager";

export default function useQuery(packet) {
  let [query, variables, options = {}] = packet;
  let client = options.client || defaultClientManager.getDefaultClient();
  let [queryState, setQueryState] = useState(QueryManager.initialState);
  let [queryManager, setQueryManager] = useState(null);

  useEffect(() => {
    if (!queryManager) {
      let queryManager = new QueryManager({ client, cache: options.cache, setState: setQueryState }, packet);
      queryManager.load();
      setQueryManager(queryManager);
    } else {
      queryManager.updateIfNeeded(packet);
    }
    return () => queryManager && queryManager.dispose();
  });

  return queryState;
}
