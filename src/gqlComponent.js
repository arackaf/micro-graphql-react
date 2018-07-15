import React, { Component } from "react";
import { defaultClientManager } from "./client";

import QueryManager from "./queryManager";
import MutationManager from "./mutationManager";

export const buildQuery = (queryText, variables, options) => [queryText, variables, options];
export const buildMutation = (mutation, options) => [mutation, options];

export default class GraphQL extends Component {
  queryManagerMap = {};
  mutationManagerMap = {};
  get client() {
    return this.props.client || defaultClientManager.getDefaultClient();
  }
  constructor(props) {
    super(props);

    this.state = { queries: {}, mutations: {} };
    let { query = {}, mutation = {} } = this.props;

    Object.keys(query).forEach(k => {
      let packet = query[k];
      let setState = state => {
        this.setState(oldState => ({ queries: { ...oldState.queries, [k]: state } }));
      };
      let options = packet[2] || {};
      this.queryManagerMap[k] = new QueryManager({ client: options.client || this.client, setState, cache: options.cache }, packet);
      this.state.queries[k] = this.queryManagerMap[k].currentState;
    });
    Object.keys(mutation).forEach(k => {
      let packet = mutation[k];
      let setState = state => {
        this.setState(oldState => ({ mutations: { ...oldState.mutations, [k]: state } }));
      };
      let options = packet[1] || {};
      this.mutationManagerMap[k] = new MutationManager({ client: options.client || this.client, setState }, packet);
      this.state.mutations[k] = this.mutationManagerMap[k].currentState;
    });
  }
  componentDidMount() {
    let { query = {}, mutation = {} } = this.props;
    Object.keys(query).forEach(k => this.queryManagerMap[k].load());
    Object.keys(mutation).forEach(k => this.mutationManagerMap[k].updateState());
  }
  componentDidUpdate(prevProps, prevState) {
    let { query = {} } = this.props;

    Object.keys(query).forEach(k => {
      let queryManager = this.queryManagerMap[k];
      let packet = query[k];
      queryManager.updateIfNeeded(packet);
    });
  }
  componentWillUnmount() {
    Object.keys(this.queryManagerMap).forEach(k => this.queryManagerMap[k].dispose());
  }
  render() {
    let { query = {}, mutation, children } = this.props;

    return children ? children({ ...this.state.queries, ...this.state.mutations }) : null;
  }
}
