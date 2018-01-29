var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import React, { Component } from "react";
import equal from "deep-equal";

export default ((client, queryFn, options) => BaseComponent => {
  //TODO: validate
  const sharedState = {
    currentQuery: null,
    currentVariables: null,
    currentQueryData: null,
    currentQueryError: null,
    currentExecution: null
  };
  let componentCount = 0;

  const isDirty = ({ query, variables, currentQuery, currentVariables }) => {
    if (query !== currentQuery) {
      return true;
    } else if (typeof variables === "object") {
      return !equal(currentVariables, variables);
    }
  };

  return class extends Component {
    constructor(...args) {
      var _temp;

      return _temp = super(...args), this.state = { loading: false, loaded: false, data: null }, this.handleExecution = promise => {
        Promise.resolve(promise).then(resp => {
          if (resp.errors) {
            this.handlerError(resp.errors);
          } else {
            this.currentQueryData = resp.data;
            this.currentQueryError = null;
            this.currentExecution = null;
            this.setCurrentState();
          }
        }).catch(this.handlerError);
      }, this.handlerError = err => {
        this.currentQueryData = null;
        this.currentQueryError = err;
        this.setCurrentState();
      }, this.setCurrentState = () => {
        this.setState({
          loading: false,
          loaded: true,
          data: this.currentQueryData,
          error: this.currentQueryError
        });
      }, this.executeNow = () => {
        let queryPacket = queryFn(this.props);
        this.execute(queryPacket);
      }, _temp;
    }

    componentDidMount() {
      componentCount++;
      this.ownState = componentCount > 1;

      ["currentQuery", "currentVariables", "currentQueryData", "currentQueryError", "currentExecution"].forEach(prop => {
        Object.defineProperty(this, prop, {
          get() {
            return this.ownState ? this["_" + prop] : sharedState[prop];
          },
          set(val) {
            if (this.ownState) {
              this["_" + prop] = val;
            } else {
              sharedState[prop] = val;
            }
          }
        });
      });

      let queryPacket = queryFn(this.props);
      if (this.isDirty(queryPacket)) {
        this.execute(queryPacket);
      } else {
        if (this.currentExecution) {
          this.handleExecution(this.currentExecution);
        } else {
          this.setCurrentState();
        }
      }
    }

    isDirty(queryPacket) {
      return isDirty(_extends({}, queryPacket, { currentQuery: this.currentQuery, currentVariables: this.currentVariables }));
    }
    componentDidUpdate(prevProps, prevState) {
      let queryPacket = queryFn(this.props);
      if (this.isDirty(queryPacket)) {
        this.execute(queryPacket);
      }
    }
    execute({ query, variables }) {
      this.currentQuery = query;
      this.currentVariables = variables;
      if (!this.state.loading || this.state.loaded) {
        this.setState({
          loading: true,
          loaded: false
        });
      }
      this.currentExecution = client.runQuery(query, variables);
      this.handleExecution(this.currentExecution);
    }

    componentWillUnmount() {
      componentCount--;
    }
    render() {
      let { loading, loaded, data, error } = this.state;
      let packet = { loading, loaded, data, error, reload: this.executeNow };

      return React.createElement(BaseComponent, _extends({}, packet, this.props));
    }
  };
});