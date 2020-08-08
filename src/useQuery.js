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
  let cacheRef = useRef(clientRef.current.getCache(query) || clientRef.current.newCacheForQuery(query));

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
  let queryStateRef = useRef(queryState);

  const getQueryManager = cache =>
    new QueryManager({
      client: clientRef.current,
      cache,
      hookRefs: { isActiveRef, queryStateRef },
      setState: setQueryState,
      refreshCurrent: refresh,
      query,
      suspense
    });

  let [queryManager, setQueryManager] = useState(() => getQueryManager(cacheRef.current));

  let resetQueryManager = cacheFilter => {
    let newCache = cacheRef.current.clone(cacheFilter);
    clientRef.current.setCache(query, newCache);

    setQueryManager(getQueryManager(newCache));
  };

  let reload = () => resetQueryManager(([k]) => k != queryStateRef.current.currentQuery);
  let hardReset = () => resetQueryManager(() => false);
  let softReset = newResults => {
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
    let unregisterQuery = clientRef.current.registerQuery(query, refresh);

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
      clearCacheAndReload: hardReset
    };
  }, [queryState, queryManager, cacheRef.current]);
}

export const useSuspenseQuery = (query, variables, options = {}) => useQuery(query, variables, options, { suspense: true });
