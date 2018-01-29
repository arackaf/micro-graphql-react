import React, { Component } from "react";
import equal from "deep-equal";

export default (client, queryFn, options) => BaseComponent => {
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
    state = { loading: false, loaded: false, data: null };
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
      return isDirty({ ...queryPacket, currentQuery: this.currentQuery, currentVariables: this.currentVariables });
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
      this.currentExecution = client.run(query, variables);
      this.handleExecution(this.currentExecution);
    }
    handleExecution = promise => {
      Promise.resolve(promise)
        .then(resp => {
          if (resp.errors) {
            this.handlerError(resp.errors);
          } else {
            this.currentQueryData = resp.data;
            this.currentQueryError = null;
            this.currentExecution = null;
            this.setCurrentState();
          }
        })
        .catch(this.handlerError);
    };
    handlerError = err => {
      this.currentQueryData = null;
      this.currentQueryError = err;
      this.setCurrentState();
    };

    setCurrentState = () => {
      this.setState({
        loading: false,
        loaded: true,
        data: this.currentQueryData,
        error: this.currentQueryError
      });
    };
    executeNow = () => {
      let queryPacket = queryFn(this.props);
      this.execute(queryPacket);
    };
    componentWillUnmount() {
      componentCount--;
    }
    render() {
      let { loading, loaded, data, error } = this.state;
      let packet = { loading, loaded, data, error, reload: this.executeNow };

      return <BaseComponent {...packet} />;
    }
  };
};
