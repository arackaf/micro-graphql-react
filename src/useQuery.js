import React from "react";
const { useState, useEffect, useMemo } = React;

import { defaultClientManager } from "./client";
import QueryManager from "./queryManager";

export default function useQuery(packet) {
  let [query, variables, options = {}] = packet;
  let client = options.client || defaultClientManager.getDefaultClient();

  let [queryState, setQueryState] = useState(QueryManager.currentState);
  let queryManager = useMemo(
    () => {
      let queryManager = new QueryManager({ client, cache: options.cache, setState: setQueryState }, packet);
      queryManager.load();
      return queryManager;
    },
    [0]
  );

  return queryState;
}
