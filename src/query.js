import React, { Component } from "react";
import equal from "deep-equal";

export default (client, queryFn, options) => BaseComponent => {
  //TODO: validate
  let currentQuery = null;
  let currentVariables = null;
  let currentQueryData = null;
  let currentQueryError = null;

  const isDirty = ({ query, variables }) => {
    if (query !== currentQuery) {
      return true;
    } else if (typeof variables === "object") {
      return !equal(currentVariables, variables);
    }
  };

  return class componentName extends Component {
    state = { loading: false, loaded: false, data: null };
    componentDidMount() {
      let queryPacket = queryFn(this.props);
      if (isDirty(queryPacket)) {
        this.execute(queryPacket);
      } else {
        this.setCurrentState();
      }
    }
    componentDidUpdate(prevProps, prevState) {
      let queryPacket = queryFn(this.props);
      if (isDirty(queryPacket)) {
        this.execute(queryPacket);
      }
    }
    execute({ query, variables }) {
      currentQuery = query;
      currentVariables = variables;
      this.setState({
        loading: true,
        loaded: false
      });
      client
        .run(query, variables)
        .then(resp => {
          if (resp.errors) {
            this.handlerError(resp.errors);
          } else {
            currentQuery = query;
            currentQueryData = resp.data;
            currentQueryError = null;
            this.setCurrentState();
          }
        })
        .catch(this.handlerError);
    }
    handlerError = err => {
      currentQueryData = null;
      currentQueryError = err;
      this.setCurrentState();
    };

    setCurrentState = () => {
      this.setState({
        loading: false,
        loaded: true,
        data: currentQueryData,
        error: currentQueryError
      });
    };

    render() {
      let { loading, loaded, data, error } = this.state;
      return <BaseComponent {...{ loading, loaded, data, error }} />;
    }
  };
};
