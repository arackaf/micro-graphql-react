const deConstructQueryPacket = packet => {
  if (typeof packet === "string") {
    return [packet, null, {}];
  } else if (Array.isArray(packet)) {
    return [packet[0], packet[1] || null, packet[2] || {}];
  }
};

export default class QueryManager {
  mutationSubscription = null;
  static initialState = {
    loading: false,
    loaded: false,
    data: null,
    error: null
  };
  currentState = { ...QueryManager.initialState };

  constructor({ client, setState, cache }, packet) {
    const [query, variables, options] = deConstructQueryPacket(packet);
    this.client = client;
    this.setState = setState;
    this.cache = cache || client.getCache(query) || client.newCacheForQuery(query);
    this.unregisterQuery = this.client.registerQuery(query, this.refresh);
    if (typeof options.onMutation === "object") {
      if (!Array.isArray(options.onMutation)) {
        options.onMutation = [options.onMutation];
      }
      this.mutationSubscription = this.client.subscribeMutation(options.onMutation, {
        cache: this.cache,
        softReset: this.softReset,
        hardReset: this.hardReset,
        refresh: this.refresh,
        currentResults: () => this.currentState.data
      });
    }
    this.currentState.reload = this.reload;
    this.currentState.clearCache = () => this.cache.clearCache();
    this.currentState.clearCacheAndReload = this.clearCacheAndReload;
  }
  updateState = newState => {
    Object.assign(this.currentState, newState);
    this.setState(Object.assign({}, this.currentState));
  };
  refresh = () => {
    this.load();
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
    this.cache.clearCache();
    this.reload();
  };
  reload = () => {
    this.execute();
  };
  load(packet, force) {
    if (packet) {
      const [query, variables] = deConstructQueryPacket(packet);
      let graphqlQuery = this.client.getGraphqlQuery({ query, variables });
      if (force || graphqlQuery != this.currentUri) {
        this.currentUri = graphqlQuery;
      } else {
        return;
      }
    }

    let graphqlQuery = this.currentUri;
    this.cache.getFromCache(
      graphqlQuery,
      promise => {
        Promise.resolve(promise).then(() => {
          //cache should now be updated, unless it was cleared. Either way, re-run this method
          this.load();
        });
      },
      cachedEntry => {
        this.updateState({ data: cachedEntry.data, error: cachedEntry.error, loading: false, loaded: true, currentQuery: graphqlQuery });
      },
      () => this.execute()
    );
  }
  execute() {
    let graphqlQuery = this.currentUri;
    this.updateState({ loading: true });
    let promise = this.client.runUri(this.currentUri);
    this.cache.setPendingResult(graphqlQuery, promise);
    this.handleExecution(promise, graphqlQuery);
  }
  handleExecution = (promise, cacheKey) => {
    this.currentPromise = promise;
    Promise.resolve(promise)
      .then(resp => {
        if (this.currentPromise !== promise) {
          return;
        }
        this.cache.setResults(promise, cacheKey, resp);

        if (resp.errors) {
          this.updateState({ loaded: true, loading: false, data: null, error: resp.errors, currentQuery: cacheKey });
        } else {
          this.updateState({ loaded: true, loading: false, data: resp.data, error: null, currentQuery: cacheKey });
        }
      })
      .catch(err => {
        this.cache.setResults(promise, cacheKey, null, err);
        this.updateState({ loaded: true, loading: false, data: null, error: err, currentQuery: cacheKey });
      });
  };
  dispose() {
    this.mutationSubscription && this.mutationSubscription();
    this.unregisterQuery();
  }
}
