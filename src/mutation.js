import React, { Component } from "react";
import { defaultClientManager } from "./client";

export default (mutation, packet = {}) => BaseComponent => {
  return class extends Component {
    state = { running: false, finished: false };

    componentDidMount() {
      let { mapProps = props => props, client: clientOption } = packet;
      let client = clientOption || defaultClientManager.getDefaultClient();

      if (!client) {
        throw "[micro-graphql-error]: No client is configured. See the docs for info on how to do this.";
      }

      this.client = client;
    }

    runMutation = variables => {
      this.setState({
        running: true,
        finished: false
      });

      return this.client.processMutation(mutation, variables).then(resp => {
        this.setState({
          running: false,
          finished: true
        });
        return resp;
      });
    };

    render() {
      let { mapProps = props => props } = packet;
      let { running, finished } = this.state;
      let clientPacket = mapProps({ running, finished, runMutation: this.runMutation });

      return <BaseComponent {...clientPacket} {...this.props} />;
    }
  };
};
