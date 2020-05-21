import { defaultClientManager } from "./client";

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

  constructor({ client, cache, packet, isActive, suspense }) {
    const [query, variables, options] = deConstructQueryPacket(packet);
    this.client = client || defaultClientManager.getDefaultClient();
    this.cache = cache || this.client.getCache(query) || this.client.newCacheForQuery(query);
    this.unregisterQuery = this.client.registerQuery(query, this.refresh);
    this.options = options;
    this.active = false;
    this.suspense = suspense;

    this.currentState.reload = this.reload;
    this.currentState.clearCache = () => this.cache.clearCache();
    this.currentState.clearCacheAndReload = this.clearCacheAndReload;

    if (isActive) {
      this.initialSync(packet);
    }
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
        currentResults: () => this.currentState.data,
        isActive: () => this.active
      });
    }
  }
  updateState = newState => {
    Object.assign(this.currentState, newState);
    this.setState && this.setState(Object.assign({}, this.currentState));
  };
  refresh = () => {
    this.update();
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
    this.execute(this.currentUri);
  };
  initialSync(packet) {
    const [query, variables] = deConstructQueryPacket(packet);
    let graphqlQuery = this.client.getGraphqlQuery({ query, variables });

    this.cache.getFromCache(
      graphqlQuery,
      promise => {
        this.updateState({ loading: true });
      },
      cachedEntry => {
        this.updateState({ data: cachedEntry.data, error: cachedEntry.error || null, loading: false, loaded: true, currentQuery: graphqlQuery });
      }
    );
  }
  sync({ packet, isActive }) {
    let wasInactive = !this.active;
    this.active = isActive;

    if (!this.active) {
      return;
    }

    const [query, variables] = deConstructQueryPacket(packet);
    let graphqlQuery = this.client.getGraphqlQuery({ query, variables });
    if (graphqlQuery != this.currentUri) {
      this.currentUri = graphqlQuery;
      this.update();
    } else if (wasInactive && this.active) {
      this.update();
    }
  }
  update() {
    let suspense = this.suspense;
    let graphqlQuery = this.currentUri;
    this.cache.getFromCache(
      graphqlQuery,
      promise => {
        let updatingPromise = Promise.resolve(promise).then(() => {
          //cache should now be updated, unless it was cleared. Either way, re-run this method
          this.update();
        });

        this.promisePending(updatingPromise);
      },
      cachedEntry => {
        this.updateState({ data: cachedEntry.data, error: cachedEntry.error || null, loading: false, loaded: true, currentQuery: graphqlQuery });
      },
      () => {
        let promise = this.execute(graphqlQuery);
        this.promisePending(promise);
      }
    );
  }
  promisePending(promise) {
    if (this.suspense) {
      throw promise;
    } else {
      this.updateState({ loading: true });
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
        this.cache.setResults(promise, cacheKey, resp);
        this.update();
      })
      .catch(err => {
        this.cache.setResults(promise, cacheKey, null, err);
        this.update();
      });
  };
  dispose() {
    this.mutationSubscription && this.mutationSubscription();
    this.unregisterQuery();
  }
}
