import React, { Component } from "react";

export default (client, queryFn, { shouldQueryUpdate, manual } = {}) => BaseComponent => {
  const cache = new Map([]);
  const clearCache = () => cache.clear();
  const noCaching = !client.cacheSize;

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
      if (noCaching) {
        this.execute(queryPacket);
      } else {
        let cachedEntry = cache.get(graphqlQuery);
        if (cachedEntry) {
          if (typeof cachedEntry.then === "function") {
            Promise.resolve(cachedEntry).then(() => {
              //cache should now be updated, unless it was cleared. Either way, re-run this method
              this.loadQuery(queryPacket);
            });
          } else {
            //re-insert to put it at the fornt of the line
            cache.delete(graphqlQuery);
            cache.set(graphqlQuery, cachedEntry);
            this.setCurrentState(cachedEntry.data, cachedEntry.error);
          }
        } else {
          this.execute(queryPacket);
        }
      }
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
      //front of the line now, to support LRU ejection
      if (!noCaching) {
        cache.delete(graphqlQuery);
        if (cache.size === client.cacheSize) {
          //maps iterate entries and keys in insertion order - zero'th key should be oldest
          cache.delete([...cache.keys()][0]);
        }
        cache.set(graphqlQuery, promise);
      }
      this.handleExecution(promise, graphqlQuery);
    }

    handleExecution = (promise, cacheKey) => {
      Promise.resolve(promise)
        .then(resp => {
          this.cacheResults(promise, cacheKey, resp);
          if (resp.errors) {
            this.handlerError(resp.errors);
          } else {
            this.setCurrentState(resp.data, null);
          }
        })
        .catch(err => {
          this.cacheResults(promise, cacheKey, null, err);
          this.handlerError(err);
        });
    };

    cacheResults(promise, cacheKey, resp, err) {
      if (noCaching) {
        return;
      }

      //cache may have been cleared while we were running. If so, we'll respect that, and not touch the cache, but
      //we'll still use the results locally
      if (cache.get(cacheKey) !== promise) return;

      if (err) {
        cache.set(cacheKey, { data: null, error: err });
      } else {
        if (resp.errors) {
          cache.set(cacheKey, { data: null, error: errors });
        } else {
          cache.set(cacheKey, { data: resp.data, error: null });
        }
      }
    }

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
      clearCache();
      this.executeNow();
    };

    render() {
      let { loading, loaded, data, error } = this.state;
      let packet = { loading, loaded, data, error, reload: this.executeNow, clearCache, clearCacheAndReload: this.clearCacheAndReload };

      return <BaseComponent {...packet} {...this.props} />;
    }
  };
};
