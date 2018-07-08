export const setPendingResultSymbol = Symbol("setPendingResult");
export const setResultsSymbol = Symbol("setResults");
export const getFromCacheSymbol = Symbol("getFromCache");
export const noCachingSymbol = Symbol("noCaching");
export const cacheSymbol = Symbol("cache");

export default class QueryCache {
  constructor(cacheSize = DEFAULT_CACHE_SIZE) {
    this.cacheSize = cacheSize;
  }
  [cacheSymbol] = new Map([]);
  get [noCachingSymbol]() {
    return !this.cacheSize;
  }

  get entries() {
    return [...this[cacheSymbol]];
  }

  get(key) {
    return this[cacheSymbol].get(key);
  }

  set(key, results) {
    this[cacheSymbol].set(key, results);
  }

  delete(key) {
    this[cacheSymbol].delete(key);
  }

  clearCache() {
    this[cacheSymbol].clear();
  }

  [setPendingResultSymbol](graphqlQuery, promise) {
    let cache = this[cacheSymbol];
    //front of the line now, to support LRU ejection
    if (!this[noCachingSymbol]) {
      cache.delete(graphqlQuery);
      if (cache.size === this.cacheSize) {
        //maps iterate entries and keys in insertion order - zero'th key should be oldest
        cache.delete([...cache.keys()][0]);
      }
      cache.set(graphqlQuery, promise);
    }
  }

  [setResultsSymbol](promise, cacheKey, resp, err) {
    let cache = this[cacheSymbol];
    if (this[noCachingSymbol]) {
      return;
    }

    //cache may have been cleared while we were running. If so, we'll respect that, and not touch the cache, but
    //we'll still use the results locally
    if (cache.get(cacheKey) !== promise) return;

    if (err) {
      cache.set(cacheKey, { data: null, error: err });
    } else {
      if (resp.errors) {
        cache.set(cacheKey, { data: null, error: resp.errors });
      } else {
        cache.set(cacheKey, { data: resp.data, error: null });
      }
    }
  }

  [getFromCacheSymbol](key, ifPending, ifResults, ifNotFound) {
    let cache = this[cacheSymbol];
    if (this[noCachingSymbol]) {
      ifNotFound();
    } else {
      let cachedEntry = cache.get(key);
      if (cachedEntry) {
        if (typeof cachedEntry.then === "function") {
          ifPending(cachedEntry);
        } else {
          //re-insert to put it at the fornt of the line
          cache.delete(key);
          this.set(key, cachedEntry);
          ifResults(cachedEntry);
        }
      } else {
        ifNotFound();
      }
    }
  }
}

export const DEFAULT_CACHE_SIZE = 10;
