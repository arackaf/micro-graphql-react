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
  let isActiveRef = useRef(isActive);

  let cacheRef = useRef(options.cache || clientRef.current.getCache(query) || clientRef.current.newCacheForQuery(query));

  let [queryState, setQueryState] = useState(() => {
    let existingState = {};
    if (isActiveRef.current) {
      let graphqlQuery = clientRef.current.getGraphqlQuery({ query, variables });

      cacheRef.current.getFromCache(
        graphqlQuery,
        promise => {},
        cachedEntry => {
          existingState = { data: cachedEntry.data, error: cachedEntry.error || null, loading: false, loaded: true, currentQuery: graphqlQuery };
        },
        () => {}
      );
    }

    return { ...initialState, ...existingState };
  });

  let [queryManager, setQueryManager] = useState(() => {
    let client = clientRef.current;
    let queryManager = new QueryManager({
      client,
      cache: cacheRef.current,
      isActiveRef,
      setState: setQueryState,
      refreshCurrent,
      query,
      options,
      suspense,
      preloadOnly: options.preloadOnly
    });

    return queryManager;
  });

  queryManager.getState = () => queryState;

  if (isActive) {
    queryManager.sync({ query, variables, queryState });
  }
  useLayoutEffect(() => {
    queryManager.init();
    return () => queryManager.dispose();
  }, []);

  useLayoutEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  return useMemo(() => {
    return {
      ...queryState,
      reload: queryManager.reload,
      clearCache: () => cacheRef.current.clearCache(),
      clearCacheAndReload: queryManager.clearCacheAndReload
    };
  }, [queryState, queryManager, cacheRef.current]);
}

export const useSuspenseQuery = (query, variables, options = {}) => useQuery(query, variables, options, { suspense: true });
