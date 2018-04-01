"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _client = require("./client");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (clientDeprecated, mutation, packet = {}) => BaseComponent => {
  if (typeof clientDeprecated === "object") {
    console.warn("Passing client as the first arg to query is deprecated. Check the docs, but you can now import setDefaultClient and call that globally, or you can pass in the options object");
  } else {
    packet = mutation || {};
    mutation = clientDeprecated;
    clientDeprecated = null;
  }

  const { mapProps = props => props, client: clientOption } = packet;
  const client = clientOption || clientDeprecated || _client.defaultClientManager.getDefaultClient();

  if (!client) {
    throw "[micro-graphql-error]: No client is configured. See the docs for info on how to do this.";
  }

  return class extends _react.Component {
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
      let packet = mapProps({ running, finished, runMutation: this.runMutation });

      return _react2.default.createElement(BaseComponent, _extends({}, packet, this.props));
    }
  };
};