var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import React, { Component } from "react";

export default ((client, mutation) => BaseComponent => {
  return class extends Component {
    constructor(...args) {
      var _temp;

      return _temp = super(...args), this.state = { running: false, finished: false }, this.runMutation = variables => {
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
      }, _temp;
    }

    render() {
      let { running, finished } = this.state;
      let packet = { running, finished, runMutation: this.runMutation };

      return React.createElement(BaseComponent, _extends({}, packet, this.props));
    }
  };
});