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
  let refresh = () => {
    setDeactivateQueryToken(x => x + 1);
  };

  let clientRef = useRef(options.client || defaultClientManager.getDefaultClient());
  let customCache = useRef(!!options.cache);
  let cacheRef = useRef(options.cache || clientRef.current.getCache(query) || clientRef.current.newCacheForQuery(query));

  let isActive = !("active" in options && !options.active);
  let isActiveRef = useRef(isActive);

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
  const queryStateRef = useRef(queryState);
  useLayoutEffect(() => {
    queryStateRef.current = queryState;
  }, [queryState]);

  let [queryManager, setQueryManager] = useState(() => {
    let client = clientRef.current;
    let queryManager = new QueryManager({
      client,
      cache: cacheRef.current,
      hookRefs: { isActiveRef, queryStateRef },
      setState: setQueryState,
      refreshCurrent: refresh,
      query,
      options,
      suspense
    });

    return queryManager;
  });

  if (isActive) {
    queryManager.sync({ query, variables, queryState });
  }

  // ------------------------------- effects -------------------------------

  useLayoutEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useLayoutEffect(() => {
    const softReset = newResults => {
      cacheRef.current.clearCache();
      cacheRef.current.softResetCache = { [queryStateRef.current.currentQuery]: { data: newResults } };
      setQueryState({ data: newResults });
    };
    const hardReset = () => {
      cacheRef.current.clearCache();
      queryManager.reload();
    };

    let mutationSubscription;
    if (typeof options.onMutation === "object") {
      let onMutation = !Array.isArray(options.onMutation) ? [options.onMutation] : options.onMutation;

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
      mutationSubscription && mutationSubscription();
      queryManager.dispose();
    };
  }, [queryManager]);
  // ------------------------------- effects -------------------------------

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
