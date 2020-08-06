import React, { useMemo } from "react";
const { useState, useRef, useLayoutEffect } = React;

import { defaultClientManager } from "./client";
import QueryManager from "./queryManager";

const initialState = {
  loading: false,
  loaded: false,
  data: null,
  error: null
};

export default function useQuery(query, variables, options = {}, { suspense } = {}) {
  let [deactivateQueryToken, setDeactivateQueryToken] = useState(0);
  let refreshCurrent = () => {
    setDeactivateQueryToken(x => x + 1);
  };

  let clientRef = useRef(options.client || defaultClientManager.getDefaultClient());
  let customCache = useRef(!!options.cache);

  let isActive = !("active" in options && !options.active);

  let [cache, setCache] = useState(() => {
    let client = clientRef.current;
    return options.cache || client.getCache(query) || client.newCacheForQuery(query);
  });

  let [queryState, setQueryState] = useState(() => {
    let existingState = {};
    if (isActive) {
      let graphqlQuery = clientRef.current.getGraphqlQuery({ query, variables });

      cache.getFromCache(
        graphqlQuery,
        promise => {},
        cachedEntry => {
          existingState = { data: cachedEntry.data, error: cachedEntry.error || null, loading: false, loaded: true, currentQuery: graphqlQuery };
        },
        () => {}
      );
    }

    return { ...initialState, isActive, ...existingState };
  });

  let [queryManager, setQueryManager] = useState(() => {
    let client = clientRef.current;
    let queryManager = new QueryManager({
      client,
      cache,
      setState: setQueryState,
      refreshCurrent,
      query,
      options,
      suspense,
      preloadOnly: options.preloadOnly
    });

    return queryManager;
  });

  useLayoutEffect(() => {
    queryManager.init();
    return () => queryManager.dispose();
  }, []);

  queryManager.getState = () => queryState;

  queryManager.sync({ query, variables, isActive, queryState });

  return useMemo(() => {
    return {
      ...queryState,
      reload: queryManager.reload,
      clearCache: () => cache.clearCache(),
      clearCacheAndReload: queryManager.clearCacheAndReload
    };
  }, [queryState, queryManager, cache]);
}

export const useSuspenseQuery = (query, variables, options = {}) => useQuery(query, variables, options, { suspense: true });
