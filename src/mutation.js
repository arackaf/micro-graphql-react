import React, { Component } from "react";
import { defaultClientManager } from "./client";
import MutationManager from "./mutationManager";

export default (mutation, packet = {}) => BaseComponent => {
  return class extends Component {
    constructor(props) {
      super(props);

      let { mapProps = props => props, client: clientOption } = packet;
      let client = clientOption || defaultClientManager.getDefaultClient();

      if (!client) {
        throw "[micro-graphql-error]: No client is configured. See the docs for info on how to do this.";
      }

      let setState = state => this.setState({ mutationProps: state });
      this.mutationManager = new MutationManager({ client, setState }, [mutation]);
      this.state = { mutationProps: this.mutationManager.currentState };
    }

    render() {
      let { mapProps = props => props } = packet;
      let { running, finished } = this.state.mutationProps;
      let clientPacket = mapProps({ running, finished, runMutation: this.mutationManager.runMutation });

      return <BaseComponent {...clientPacket} {...this.props} />;
    }
  };
};
