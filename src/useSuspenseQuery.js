import React from "react";
const { useState, useRef, useLayoutEffect } = React;

import { defaultClientManager } from "./client";
import QueryManager from "./queryManager";

export default function useQuery(packet) {
  let [query, variables, options = {}] = packet;
  let client = options.client || defaultClientManager.getDefaultClient();
  let [queryState, setQueryState] = useState(QueryManager.initialState);
  let [queryManager] = useState(() => new QueryManager({ client, cache: options.cache, setState: setQueryState }, packet));

  useLayoutEffect(() => {
    if (!("active" in options && !options.active)) {
      queryManager.load(packet, false, true);
    }
  });

  useLayoutEffect(() => () => queryManager && queryManager.dispose(), []);

  return queryState;
}
