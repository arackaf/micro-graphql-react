import React, { Component } from "react";
import equal from "deep-equal";

export default (client, queryFn, options) => BaseComponent => {
  //TODO: validate
  let currentQuery = null;
  let currentVariables = null;
  let currentQueryData = null;

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
        //TODO: remember error state
        this.setState({
          loading: false,
          loaded: true,
          data: currentQueryData
        });
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
          currentQuery = query;
          currentQueryData = resp.data;

          this.setState({
            loading: false,
            loaded: true,
            data: resp.data
          });
        })
        .catch(err => {
          this.setState({
            loading: false,
            loaded: true,
            data: null,
            error: err
          });
        });
    }

    render() {
      let { loading, loaded, data } = this.state;
      return <BaseComponent {...{ loading, loaded, data }} />;
    }
  };
};
