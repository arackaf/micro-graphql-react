import React, { Component } from "react";
import { defaultClientManager } from "./client";

class QueryPacket {
  constructor(client, packet) {
    this.client = client;
    if (typeof packet === "string") {
      query = packet;
    } else if (Array.isArray(packet)) {
      this.query = packet[0];
      this.variables = packet[1];
    }
    this.execute();
  }
  execute() {
    this.client.runQuery(this.query, this.variables);
  }
}

export default class GraphQL extends Component {
  queryMap = {};
  mutationMap = {};
  get client() {
    return this.props.client || defaultClientManager.getDefaultClient();
  }
  componentDidMount() {
    let client = this.client;
    let { query = {}, mutation = {} } = this.props;

    Object.keys(query).forEach(k => {
      let packet = query[k];
      this.queryMap[k] = new QueryPacket(client, packet);
    });
  }
  render() {
    let { query, mutation, children } = this.props;
    return children();
  }
}
