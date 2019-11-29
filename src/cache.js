export default class Cache {
  constructor(cacheSize = DEFAULT_CACHE_SIZE) {
    this.cacheSize = cacheSize;
  }
  _cache = new Map([]);
  get noCaching() {
    return !this.cacheSize;
  }

  get keys() {
    return [...this._cache.keys()];
  }

  get entries() {
    return [...this._cache];
  }

  get(key) {
    return this._cache.get(key);
  }

  set(key, results) {
    this._cache.set(key, results);
  }

  clearCache() {
    this._cache.clear();
  }

  setPendingResult(graphqlQuery, promise) {
    let cache = this._cache;
    //front of the line now, to support LRU ejection
    if (!this.noCaching) {
      cache.delete(graphqlQuery);
      if (cache.size === this.cacheSize) {
        //maps iterate entries and keys in insertion order - zero'th key should be oldest
        cache.delete([...cache.keys()][0]);
      }
      cache.set(graphqlQuery, promise);
    }
  }

  setResults(promise, cacheKey, resp, err) {
    let cache = this._cache;
    if (this.noCaching) {
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

  getFromCache(key, ifPending, ifResults, ifNotFound = () => {}) {
    let cache = this._cache;
    if (this.noCaching) {
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
