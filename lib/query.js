import React, { Component } from "react";

export default (client, queryFn, options) => BaseComponent => {
  //TODO: validate
  let currentQuery = null;
  let currentQueryData = null;

  return class componentName extends Component {
    state = { loading: false, loaded: false, data: null };
    componentDidMount() {
      let query = queryFn(this.props);
      if (query.query !== currentQuery) {
        this.execute(query.query);
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
      let query = queryFn(this.props);
      if (query.query !== currentQuery) {
        this.execute(query.query);
      }
    }
    execute(query) {
      currentQuery = query;
      this.setState({
        loading: true,
        loaded: false
      });
      client
        .run(query)
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
