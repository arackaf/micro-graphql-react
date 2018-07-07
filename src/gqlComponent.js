import React, { Component } from "react";
import { defaultClientManager } from "./client";

import QueryManager from "./queryManager";
import MutationManager from "./mutationManager";

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
      this.queryManagerMap[k].load();
    });
    Object.keys(mutation).forEach(k => {
      let packet = mutation[k];
      let setState = state => {
        this.setState(oldState => ({ mutations: { ...oldState.mutations, [k]: state } }));
      };
      this.mutationManagerMap[k] = new MutationManager({ client, setState }, packet);
      this.mutationManagerMap[k].updateState();
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
  componentWillUnmount() {
    Object.keys(this.queryManagerMap).forEach(k => this.queryManagerMap[k].dispose());
  }
  render() {
    let { query = {}, mutation, children } = this.props;

    return children ? children({ ...this.state.queries, ...this.state.mutations }) : null;
  }
}
