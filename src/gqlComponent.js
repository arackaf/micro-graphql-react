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
    return [query, null];
  } else if (Array.isArray(packet)) {
    return [packet[0], packet[1] || null];
  }
};

class QueryManager {
  currentState = {
    loading: false,
    loaded: false,
    data: null,
    error: null
  };
  constructor({ client, setState }, packet) {
    const [query, variables] = deConstructQueryPacket(packet);
    this.client = client;
    this.setState = setState;
    this.cache = client.getCache(query) || client.setCache(query, new QueryCache(DEFAULT_CACHE_SIZE));
    this.query = query;
    this.variables = variables;
    this.load();
  }
  updateState = newState => {
    Object.assign(this.currentState, newState);
    this.setState(this.currentState);
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
        //TODO:
      },
      () => {
        this.updateState({ loading: true });
        let promise = this.client.runQuery(this.query, this.variables);
        this.cache[setPendingResultSymbol](graphqlQuery, promise);
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
}

export default class GraphQL extends Component {
  state = { queries: {} };
  queryManagerMap = {};
  mutationMap = {};
  get client() {
    return this.props.client || defaultClientManager.getDefaultClient();
  }
  componentDidMount() {
    let client = this.client;
    let { query = {}, mutation = {} } = this.props;

    Object.keys(query).forEach(k => {
      let packet = query[k];
      let setState = state => this.setState({ queries: { ...this.state.queries, [k]: state } });
      this.queryManagerMap[k] = new QueryManager({ client, setState }, packet);
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

    return children({ ...this.state.queries });
  }
}
