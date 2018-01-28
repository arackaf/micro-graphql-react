import React, { Component } from "react";

export default (client, queryFn, options) => BaseComponent => {
  //TODO: validate

  return class componentName extends Component {
    state = { loading: false, loaded: false, data: null };
    currentQuery = null;
    componentDidMount() {
      let query = queryFn(this.props);
      this.executeIfDirty(query.query);
    }
    executeIfDirty(query) {
      if (query === this.currentQuery) return;

      this.currentQuery = query;
      this.setState({
        loading: true,
        loaded: false
      });
      client
        .run(this.currentQuery)
        .then(resp => {
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
