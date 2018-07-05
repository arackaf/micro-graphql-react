import React, { Component } from "react";
import { defaultClientManager } from "./client";
import shallowEqual from "shallow-equal/objects";

const deConstructQueryPacket = packet => {
  if (typeof packet === "string") {
    return [query, null];
  } else if (Array.isArray(packet)) {
    return [packet[0], packet[1] || null];
  }
};

class QueryManager {
  constructor(client, packet) {
    this.client = client;
    const [query, variables] = deConstructQueryPacket(packet);
    this.query = query;
    this.variables = variables;
    this.execute();
  }
  execute() {
    this.client.runQuery(this.query, this.variables);
  }
  updateIfNeeded(packet) {
    const [query, variables] = deConstructQueryPacket(packet);
    if (query != this.query || !shallowEqual(variables || {}, this.variables || {})) {
      this.query = query;
      this.variables = variables;
      this.execute();
    }
  }
}

export default class GraphQL extends Component {
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
      this.queryManagerMap[k] = new QueryManager(client, packet);
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
    let { query, mutation, children } = this.props;
    return children();
  }
}
