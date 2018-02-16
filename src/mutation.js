import React, { Component } from "react";
import { defaultClientManager } from "./client";

export default (clientDeprecated, mutation, packet = {}) => BaseComponent => {
  if (typeof clientDeprecated === "object") {
    console.warn(
      "Passing client as the first arg to query is deprecated. Check the docs, but you can now import setDefaultClient and call that globally, or you can pass in the options object"
    );
  } else {
    packet = mutation || {};
    mutation = clientDeprecated;
    clientDeprecated = null;
  }

  const { mapProps = props => props, clientOption } = packet;
  const client = clientOption || clientDeprecated || defaultClientManager.getDefaultClient();

  return class extends Component {
    state = { running: false, finished: false };

    runMutation = variables => {
      this.setState({
        running: true,
        finished: false
      });

      return client.runMutation(mutation, variables).then(resp => {
        this.setState({
          running: false,
          finished: true
        });
        return resp;
      });
    };

    render() {
      let { running, finished } = this.state;
      let packet = mapProps({ running, finished, runMutation: this.runMutation });

      return <BaseComponent {...packet} {...this.props} />;
    }
  };
};
