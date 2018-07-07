import React, { Component } from "react";
import { defaultClientManager } from "./client";
import shallowEqual from "shallow-equal/objects";
import QueryCache, {
  setPendingResultSymbol,
  setResultsSymbol,
  getFromCacheSymbol,
  noCachingSymbol,
  cacheSymbol,
  DEFAULT_CACHE_SIZE
} from "./queryCache";

const deConstructQueryPacket = packet => {
  if (typeof packet === "string") {
    //TODO: ummm
    return [query, null];
  } else if (Array.isArray(packet)) {
    return [packet[0], packet[1] || null, packet[2] || {}];
  }
};

const deConstructMutationPacket = packet => {
  if (typeof packet === "string") {
    return [packet, null];
  } else if (Array.isArray(packet)) {
    return [packet[0], packet[1] || null];
  }
};

class MutationManager {
  runMutation = variables => {
    this.setState({
      running: true,
      finished: false
    });

    return this.client.processMutation(this.mutation, variables).then(resp => {
      this.setState({
        running: false,
        finished: true
      });
      return resp;
    });
  };
  currentState = {
    running: false,
    finished: false,
    runMutation: this.runMutation
  };
  updateState = (newState = {}) => {
    Object.assign(this.currentState, newState);
    this.setState(this.currentState);
  };
  constructor({ client, setState }, packet) {
    const [mutation, options] = deConstructMutationPacket(packet);
    this.client = client;
    this.setState = setState;
    this.mutation = mutation;
    this.updateState();
  }
}

class QueryManager {
  mutationSubscription = null;
  currentState = {
    loading: false,
    loaded: false,
    data: null,
    error: null
  };
  constructor({ client, setState }, packet) {
    const [query, variables, options] = deConstructQueryPacket(packet);
    this.client = client;
    this.setState = setState;
    this.cache = client.getCache(query) || client.setCache(query, new QueryCache(DEFAULT_CACHE_SIZE));
    this.query = query;
    this.variables = variables;
    if (typeof options.onMutation === "object") {
      if (!Array.isArray(options.onMutation)) {
        options.onMutation = [options.onMutation];
      }
      this.mutationSubscription = this.client.subscribeMutation(options.onMutation, {
        cache: this.cache,
        softReset: () => {}, //this.softReset,
        hardReset: () => {}, //this.hardReset,
        refresh: this.refresh,
        currentResults: () => this.currentState.data
      });
    }
    this.load();
  }
  updateState = newState => {
    Object.assign(this.currentState, newState);
    this.setState(this.currentState);
  };
  refresh = () => {
    this.load();
  };
  load() {
    let graphqlQuery = this.client.getGraphqlQuery({ query: this.query, variables: this.variables || null });
    this.cache[getFromCacheSymbol](
      graphqlQuery,
      promise => {
        Promise.resolve(promise).then(() => {
          //cache should now be updated, unless it was cleared. Either way, re-run this method
          this.loadQuery(queryPacket);
        });
      },
      cachedEntry => {
        this.updateState({ data: cachedEntry.data, error: cachedEntry.error, loading: false, loaded: true });
      },
      () => {
        this.updateState({ loading: true });
        let promise = this.client.runQuery(this.query, this.variables);
        this.cache[setPendingResultSymbol](graphqlQuery, promise);
        this.handleExecution(promise, graphqlQuery);
      }
    );
  }
  updateIfNeeded(packet) {
    const [query, variables] = deConstructQueryPacket(packet);
    if (!shallowEqual(variables || {}, this.variables || {})) {
      this.query = query;
      this.variables = variables;
      this.load();
    }
  }
  handleExecution = (promise, cacheKey) => {
    this.currentPromise = promise;
    Promise.resolve(promise)
      .then(resp => {
        if (this.currentPromise !== promise) {
          return;
        }
        this.cache[setResultsSymbol](promise, cacheKey, resp);

        if (resp.errors) {
          this.updateState({ loaded: true, loading: false, data: null, error: resp.errors });
        } else {
          this.updateState({ loaded: true, loading: false, data: resp.data, error: null });
        }
      })
      .catch(err => {
        this.cache[setResultsSymbol](promise, cacheKey, null, err);
        this.updateState({ loaded: true, loading: false, data: null, error: err });
      });
  };
}

export default class GraphQL extends Component {
  state = { queries: {}, mutations: {} };
  queryManagerMap = {};
  mutationManagerMap = {};
  get client() {
    return this.props.client || defaultClientManager.getDefaultClient();
  }
  componentDidMount() {
    let client = this.client;
    let { query = {}, mutation = {} } = this.props;

    Object.keys(query).forEach(k => {
      let packet = query[k];
      let setState = state => {
        this.setState(oldState => ({ queries: { ...oldState.queries, [k]: state } }));
      };
      this.queryManagerMap[k] = new QueryManager({ client, setState }, packet);
    });
    Object.keys(mutation).forEach(k => {
      let packet = mutation[k];
      let setState = state => {
        this.setState(oldState => ({ mutations: { ...oldState.mutations, [k]: state } }));
      };
      this.mutationManagerMap[k] = new MutationManager({ client, setState }, packet);
    });
  }
  componentDidUpdate(prevProps, prevState) {
    let { query = {} } = this.props;

    Object.keys(query).forEach(k => {
      let queryManager = this.queryManagerMap[k];
      let packet = query[k];
      queryManager.updateIfNeeded(packet);
    });
  }
  render() {
    let { query = {}, mutation, children } = this.props;

    return children ? children({ ...this.state.queries, ...this.state.mutations }) : null;
  }
}
