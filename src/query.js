import React, { Component } from "react";

class QueryCache {
  constructor(cacheSize = 0) {
    this.cacheSize = cacheSize;
  }
  cache = new Map([]);
  cacheSize = 0;
  get noCaching() {
    return !this.cacheSize;
  }

  setPendingResult(graphqlQuery, promise) {
    //front of the line now, to support LRU ejection
    if (!this.noCaching) {
      this.cache.delete(graphqlQuery);
      if (this.cache.size === this.cacheSize) {
        //maps iterate entries and keys in insertion order - zero'th key should be oldest
        this.cache.delete([...this.cache.keys()][0]);
      }
      this.cache.set(graphqlQuery, promise);
    }
  }

  setResults(promise, cacheKey, resp, err) {
    if (this.noCaching) {
      return;
    }

    //cache may have been cleared while we were running. If so, we'll respect that, and not touch the cache, but
    //we'll still use the results locally
    if (this.cache.get(cacheKey) !== promise) return;

    if (err) {
      this.cache.set(cacheKey, { data: null, error: err });
    } else {
      if (resp.errors) {
        this.cache.set(cacheKey, { data: null, error: errors });
      } else {
        this.cache.set(cacheKey, { data: resp.data, error: null });
      }
    }
  }

  getFromCache(key, ifPending, ifResults, ifNotFound) {
    if (this.noCaching) {
      ifNotFound();
    } else {
      let cachedEntry = this.cache.get(key);
      if (cachedEntry) {
        if (typeof cachedEntry.then === "function") {
          ifPending(cachedEntry);
        } else {
          //re-insert to put it at the fornt of the line
          this.cache.delete(key);
          this.cache.set(key, cachedEntry);
          ifResults(cachedEntry);
        }
      } else {
        ifNotFound();
      }
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export default (client, queryFn, { shouldQueryUpdate, manual, cacheSize = 10 } = {}) => BaseComponent => {
  const cache = new QueryCache(cacheSize);

  return class extends Component {
    state = { loading: false, loaded: false, data: null, error: null };
    currentGraphqlQuery = null;
    currentQuery = null;
    currentVariables = null;

    componentDidMount() {
      if (manual) return;

      let queryPacket = queryFn(this.props);
      this.loadQuery(queryPacket);
    }
    componentDidUpdate(prevProps, prevState) {
      if (manual) return;

      let queryPacket = queryFn(this.props);
      if (this.isDirty(queryPacket)) {
        if (shouldQueryUpdate) {
          if (
            shouldQueryUpdate({
              prevProps,
              props: this.props,
              prevQuery: this.currentQuery,
              query: queryPacket.query,
              prevVariables: this.currentVariables,
              variables: queryPacket.variables
            })
          ) {
            this.loadQuery(queryPacket);
          }
        } else {
          this.loadQuery(queryPacket);
        }
      }
    }

    isDirty(queryPacket) {
      let graphqlQuery = client.getGraphqlQuery(queryPacket);
      return graphqlQuery !== this.currentGraphqlQuery;
    }

    loadQuery(queryPacket) {
      let graphqlQuery = client.getGraphqlQuery(queryPacket);
      this.currentGraphqlQuery = graphqlQuery;
      this.currentQuery = queryPacket.query;
      this.currentVariables = queryPacket.variables;

      cache.getFromCache(
        graphqlQuery,
        promise => {
          Promise.resolve(promise).then(() => {
            //cache should now be updated, unless it was cleared. Either way, re-run this method
            this.loadQuery(queryPacket);
          });
        },
        cachedEntry => {
          this.setCurrentState(cachedEntry.data, cachedEntry.error);
        },
        () => this.execute(queryPacket)
      );
    }

    execute({ query, variables }) {
      if (!this.state.loading || this.state.loaded) {
        this.setState({
          loading: true,
          loaded: false
        });
      }
      let graphqlQuery = client.getGraphqlQuery({ query, variables });
      let promise = client.runQuery(query, variables);
      cache.setPendingResult(graphqlQuery, promise);
      this.handleExecution(promise, graphqlQuery);
    }

    handleExecution = (promise, cacheKey) => {
      Promise.resolve(promise)
        .then(resp => {
          cache.setResults(promise, cacheKey, resp);
          if (resp.errors) {
            this.handlerError(resp.errors);
          } else {
            this.setCurrentState(resp.data, null);
          }
        })
        .catch(err => {
          cache.setResults(promise, cacheKey, null, err);
          this.handlerError(err);
        });
    };

    handlerError = err => {
      this.setCurrentState(null, err);
    };

    setCurrentState = (data, error) => {
      this.setState({
        loading: false,
        loaded: true,
        data,
        error
      });
    };

    executeNow = () => {
      let queryPacket = queryFn(this.props);
      this.execute(queryPacket);
    };

    clearCacheAndReload = () => {
      cache.clearCache();
      this.executeNow();
    };

    render() {
      let { loading, loaded, data, error } = this.state;
      let packet = {
        loading,
        loaded,
        data,
        error,
        reload: this.executeNow,
        clearCache: () => cache.clearCache(),
        clearCacheAndReload: this.clearCacheAndReload
      };

      return <BaseComponent {...packet} {...this.props} />;
    }
  };
};
