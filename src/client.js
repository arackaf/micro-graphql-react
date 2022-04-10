import Cache, { DEFAULT_CACHE_SIZE } from "./cache";

export default class Client {
  constructor(props = { cacheSize: DEFAULT_CACHE_SIZE }) {
    Object.assign(this, props);
    this.caches = new Map([]);
    this.mutationListeners = new Set([]);
    this.forceListeners = new Map([]);
  }
  get cacheSizeToUse() {
    return this.cacheSize > 0 ? this.cacheSize : DEFAULT_CACHE_SIZE;
  }
  preload(query, variables) {
    let cache = this.getCache(query);
    if (!cache) {
      cache = this.newCacheForQuery(query);
    }

    let graphqlQuery = this.getGraphqlQuery({ query, variables });

    let promiseResult;
    cache.getFromCache(
      graphqlQuery,
      promise => {
        promiseResult = promise;
        /* already preloading - cool */
      },
      cachedEntry => {
        /* already loaded - cool */
        promiseResult = Promise.resolve(cachedEntry);
      },
      () => {
        let promise = this.runUri(graphqlQuery);
        cache.setPendingResult(graphqlQuery, promise);
        promiseResult = promise;
        promise.then(resp => {
          cache.setResults(promise, graphqlQuery, resp);
        });
      }
    );
    return promiseResult;
  }
  read(query, variables) {
    let cache = this.getCache(query);
    if (!cache) {
      cache = this.newCacheForQuery(query);
    }

    let graphqlQuery = this.getGraphqlQuery({ query, variables });

    let promiseResult;
    let cachedResult;
    cache.getFromCache(
      graphqlQuery,
      promise => {
        promiseResult = promise;
        /* already preloading - cool */
      },
      cachedEntry => {
        /* already loaded - cool */
        cachedResult = cachedEntry;
      },
      () => {
        let promise = this.runUri(graphqlQuery);
        cache.setPendingResult(graphqlQuery, promise);
        promiseResult = promise;
        promise.then(resp => {
          cache.setResults(promise, graphqlQuery, resp);
        });
      }
    );
    if (promiseResult) {
      throw promiseResult;
    }
    return cachedResult;
  }

  getCache(query) {
    return this.caches.get(query);
  }
  newCacheForQuery(query) {
    let newCache = new Cache(this.cacheSizeToUse);
    this.setCache(query, newCache);
    return newCache;
  }
  setCache(query, cache) {
    this.caches.set(query, cache);
  }
  runQuery(query, variables) {
    return this.runUri(this.getGraphqlQuery({ query, variables }));
  }
  runUri(uri) {
    return fetch(uri, this.fetchOptions || void 0).then(resp => resp.json());
  }
  getGraphqlQuery({ query, variables }) {
    return `${this.endpoint}?query=${encodeURIComponent(query)}${
      typeof variables === "object" ? `&variables=${encodeURIComponent(JSON.stringify(variables))}` : ""
    }`;
  }
  subscribeMutation(subscription, options = {}) {
    if (!Array.isArray(subscription)) {
      subscription = [subscription];
    }
    const packet = { subscription, options };
    if (!options.currentResults) {
      options.currentResults = () => ({});
    }
    this.mutationListeners.add(packet);

    return () => this.mutationListeners.delete(packet);
  }
  forceUpdate(query) {
    let updateListeners = this.forceListeners.get(query);
    if (updateListeners) {
      for (let refresh of updateListeners) {
        refresh();
      }
    }
  }
  registerQuery(query, refresh) {
    if (!this.forceListeners.has(query)) {
      this.forceListeners.set(query, new Set([]));
    }
    this.forceListeners.get(query).add(refresh);

    return () => this.forceListeners.get(query).delete(refresh);
  }
  processMutation(mutation, variables) {
    const refreshActiveQueries = query => this.forceUpdate(query);
    return Promise.resolve(this.runMutation(mutation, variables)).then(resp => {
      let mutationKeys = Object.keys(resp);
      let mutationKeysLookup = new Set(mutationKeys);
      [...this.mutationListeners].forEach(({ subscription, options: { currentResults, isActive, ...rest } }) => {
        subscription.forEach(singleSubscription => {
          if (typeof isActive === "function") {
            if (!isActive()) {
              return;
            }
          }
          if (typeof singleSubscription.when === "string") {
            if (mutationKeysLookup.has(singleSubscription.when)) {
              singleSubscription.run({ currentResults: currentResults(), refreshActiveQueries, ...rest }, resp, variables);
            }
          } else if (typeof singleSubscription.when === "object" && singleSubscription.when.test) {
            if ([...mutationKeysLookup].some(k => singleSubscription.when.test(k))) {
              singleSubscription.run({ currentResults: currentResults(), refreshActiveQueries, ...rest }, resp, variables);
            }
          }
        });
      });
      return resp;
    });
  }
  runMutation(mutation, variables) {
    let { headers = {}, ...otherOptions } = this.fetchOptions || {};
    return fetch(this.endpoint, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers
      },
      ...otherOptions,
      body: JSON.stringify({
        query: mutation,
        variables
      })
    })
      .then(resp => resp.json())
      .then(resp => resp.data);
  }
}

class DefaultClientManager {
  defaultClient = null;
  setDefaultClient = client => (this.defaultClient = client);
  getDefaultClient = () => this.defaultClient;
}

export const defaultClientManager = new DefaultClientManager();
