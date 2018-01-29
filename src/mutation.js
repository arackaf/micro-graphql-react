import React, { Component } from "react";

export default (client, mutation) => BaseComponent => {
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
      let packet = { running, finished, runMutation: this.runMutation };

      return <BaseComponent {...packet} />;
    }
  };
};
