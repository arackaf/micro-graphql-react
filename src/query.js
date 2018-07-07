import React, { Component } from "react";
import { defaultClientManager } from "./client";
import QueryCache, { DEFAULT_CACHE_SIZE } from "./queryCache";
import QueryManager from "./queryManager";

export default (query, variablesFn, packet = {}) => BaseComponent => {
  if (typeof variablesFn === "object") {
    packet = variablesFn;
    variablesFn = null;
  }
  const { mapProps = props => props, client: clientOption } = packet;
  let { onMutation } = packet;
  if (typeof onMutation === "object" && !Array.isArray(onMutation)) {
    onMutation = [onMutation];
  }

  const getQueryPacket = props => [query, variablesFn ? variablesFn(props) : null, { onMutation }];

  return class extends Component {
    state = { queryState: {} };

    constructor(props) {
      super(props);
      let client = clientOption || defaultClientManager.getDefaultClient();
      let cache = client.getCache(query) || client.setCache(query, new QueryCache(DEFAULT_CACHE_SIZE));
      if (!client) {
        throw "[micro-graphql-error]: No client is configured. See the docs for info on how to do this.";
      }
      this.client = client;
      this.cache = cache;

      let setState = queryState => this.setState({ queryState });
      this.queryManager = new QueryManager({ client, setState }, getQueryPacket(this.props));
    }
    componentDidMount() {
      this.queryManager.load();
    }
    componentDidUpdate(prevProps, prevState) {
      this.queryManager.updateIfNeeded(getQueryPacket(this.props));
    }

    componentWillUnmount() {
      this.queryManager.dispose();
    }

    render() {
      let packet = mapProps({
        ...this.state.queryState,
        reload: this.queryManager.reload,
        clearCache: () => this.cache.clearCache(),
        clearCacheAndReload: this.queryManager.clearCacheAndReload
      });

      return <BaseComponent {...packet} {...this.props} />;
    }
  };
};
