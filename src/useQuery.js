import React from "react";
const { useState, useRef, useEffect, useMemo, useLayoutEffect } = React;

import { defaultClientManager } from "./client";
import QueryManager from "./queryManager";

export default function useQuery(packet) {
  let [query, variables, options = {}] = packet;
  let client = options.client || defaultClientManager.getDefaultClient();
  let [queryState, setQueryState] = useState(QueryManager.initialState);
  let queryManager = useRef(null);

  useLayoutEffect(() => {
    if (!queryManager.current) {
      queryManager.current = new QueryManager({ client, cache: options.cache, setState: setQueryState }, packet);
      queryManager.current.load();
    } else {
      queryManager.current.updateIfNeeded(packet);
    }
  });
  useLayoutEffect(() => () => queryManager.current && queryManager.current.dispose(), []);

  return queryState;
}
