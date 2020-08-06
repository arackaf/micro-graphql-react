import { defaultClientManager } from "./client";

export default class QueryManager {
  mutationSubscription = null;
  static initialState = {
    loading: false,
    loaded: false,
    data: null,
    error: null
  };
  currentState = { ...QueryManager.initialState };

  constructor({ client, refreshCurrent, isActiveRef, cache, setState, query, options, suspense, preloadOnly }) {
    this.client = client;
    this.cache = cache;
    this.unregisterQuery = this.client.registerQuery(query, this.refresh);
    this.options = options;
    this.active = false;
    this.refreshCurrent = refreshCurrent;
    this.suspense = suspense;
    this.preloadOnly = preloadOnly;
    this.setState = setState;
    this.isActiveRef = isActiveRef;
  }
  init() {
    let options = this.options;
    if (typeof options.onMutation === "object") {
      if (!Array.isArray(options.onMutation)) {
        options.onMutation = [options.onMutation];
      }
      this.mutationSubscription = this.client.subscribeMutation(options.onMutation, {
        cache: this.cache,
        softReset: this.softReset,
        hardReset: this.hardReset,
        refresh: this.refresh,
        currentResults: () => this.getState().data,
        isActive: () => this.isActiveRef.current
      });
    }
  }
  updateState = (newState, existingState) => {
    if (!this.setState) {
      return;
    }

    if (existingState) {
      const doUpdate = Object.keys(newState).some(k => newState[k] !== existingState[k]);
      if (!doUpdate) return;
    }

    this.setState(state => Object.assign({}, state, newState));
  };
  refresh = () => {
    this.refreshCurrent();
  };
  softReset = newResults => {
    this.cache.clearCache();
    this.updateState({ data: newResults });
  };
  hardReset = () => {
    this.cache.clearCache();
    this.reload();
  };
  clearCacheAndReload = () => {
    let uri = this.getState().currentQuery;
    if (uri) {
      this.cache.clearCache();
      this.refreshCurrent();
    }
  };
  reload = () => {
    let uri = this.getState().currentQuery;
    if (uri) {
      this.cache.removeItem(uri);
      this.refreshCurrent();
    }
  };
  sync({ query, variables, queryState }) {
    let graphqlQuery = this.client.getGraphqlQuery({ query, variables });
    this.read(graphqlQuery, queryState);
  }
  read(graphqlQuery, queryState) {
    this.cache.getFromCache(
      graphqlQuery,
      promise => {
        this.promisePending(promise, queryState);
      },
      cachedEntry => {
        this.currentPromise = null;
        this.updateState(
          { data: cachedEntry.data, error: cachedEntry.error || null, loading: false, loaded: true, currentQuery: graphqlQuery },
          queryState
        );
      },
      () => {
        if (!(this.suspense && this.preloadOnly)) {
          let promise = this.execute(graphqlQuery);
          this.currentPromise = promise;
          this.promisePending(promise, queryState);
        }
      }
    );
  }
  promisePending(promise, queryState) {
    if (this.suspense) {
      throw promise;
    } else {
      this.updateState({ loading: true }, queryState);
      if (!this.suspense && promise !== this.currentPromise) {
        this.currentPromise = promise;
        this.currentPromise
          .then(() => {
            this.refreshCurrent();
          })
          .catch(() => {
            this.refreshCurrent();
          });
      }
    }
  }
  execute(graphqlQuery) {
    let promise = this.client.runUri(graphqlQuery);
    this.cache.setPendingResult(graphqlQuery, promise);
    return this.handleExecution(promise, graphqlQuery);
  }
  handleExecution = (promise, cacheKey) => {
    return Promise.resolve(promise)
      .then(resp => {
        this.currentPromise = null;
        this.cache.setResults(promise, cacheKey, resp);
        this.refreshCurrent();
      })
      .catch(err => {
        this.currentPromise = null;
        this.cache.setResults(promise, cacheKey, null, err);
        this.refreshCurrent();
      });
  };
  dispose() {
    this.mutationSubscription && this.mutationSubscription();
    this.unregisterQuery();
  }
}
