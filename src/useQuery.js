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
  const [deactivateQueryToken, setDeactivateQueryToken] = useState(0);
  const refresh = () => {
    setDeactivateQueryToken(x => x + 1);
  };

  const clientRef = useRef(options.client || defaultClientManager.getDefaultClient());
  const cacheRef = useRef(clientRef.current.getCache(query) || clientRef.current.newCacheForQuery(query));

  const isActive = !("active" in options && !options.active);
  const isActiveRef = useRef(isActive);

  const [queryState, setQueryState] = useState(() => {
    let existingState = {};
    if (isActiveRef.current) {
      const graphqlQuery = clientRef.current.getGraphqlQuery({ query, variables });

      cacheRef.current.getFromCache(
        graphqlQuery,
        promise => {},
        cachedEntry => {
          existingState = { data: cachedEntry.data, error: cachedEntry.error || null, loading: false, loaded: true, currentQuery: graphqlQuery };
        }
      );
    }

    return { ...initialState, ...existingState };
  });
  const queryStateRef = useRef(queryState);

  const getQueryManager = cache =>
    new QueryManager({
      client: clientRef.current,
      cache,
      hookRefs: { isActiveRef, queryStateRef },
      setState: setQueryState,
      refreshCurrent: suspense ? null : refresh,
      suspense
    });

  const [queryManager, setQueryManager] = useState(() => getQueryManager(cacheRef.current));

  const resetQueryManager = cacheFilter => {
    const newCache = cacheRef.current.clone(cacheFilter);
    clientRef.current.setCache(query, newCache);

    setQueryManager(getQueryManager(newCache));
  };

  const reload = () => resetQueryManager(([k]) => k != queryStateRef.current.currentQuery);
  const hardReset = () => resetQueryManager(() => false);
  const softReset = newResults => {
    if (!newResults) {
      newResults = queryStateRef.current.data;
    }
    cacheRef.current.clearCache();
    cacheRef.current.softResetCache = { [queryStateRef.current.currentQuery]: { data: newResults } };
    setQueryState({ data: newResults });
  };

  // ------------------------------- effects -------------------------------

  useLayoutEffect(() => {
    isActiveRef.current = isActive;
    queryStateRef.current = queryState;
  }, [isActive, queryState]);

  useLayoutEffect(() => {
    const unregisterQuery = clientRef.current.registerQuery(query, refresh);

    let mutationSubscription;
    if (typeof options.onMutation === "object") {
      const onMutation = !Array.isArray(options.onMutation) ? [options.onMutation] : options.onMutation;

      mutationSubscription = clientRef.current.subscribeMutation(onMutation, {
        cache: cacheRef.current,
        softReset,
        hardReset,
        refresh,
        currentResults: () => queryStateRef.current.data,
        isActive: () => isActiveRef.current
      });
    }
    return () => {
      queryManager.setState = () => {};
      queryManager.refreshCurrent = () => {};
      mutationSubscription && mutationSubscription();
      unregisterQuery();
    };
  }, [queryManager]);
  // ------------------------------- effects -------------------------------

  if (isActive) {
    queryManager.sync({ query, variables, queryState });
  }

  return useMemo(() => {
    return {
      ...queryState,
      reload,
      clearCache: () => cacheRef.current.clearCache(),
      clearCacheAndReload: hardReset,
      softReset
    };
  }, [queryState]);
}

export const useSuspenseQuery = (query, variables, options = {}) => useQuery(query, variables, options, { suspense: true });
