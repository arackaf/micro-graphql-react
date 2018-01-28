import React, { Component } from "react";
import { render } from "react-dom";
import { Client, query } from "../index";

let client = new Client({
  endpoint: "/graphql",
  fetchOptions: { credentials: "include" }
});

@query(client, props => ({
  query: `
    query ALL_BOOKS {
      allBooks(PAGE: ${props.page}, PAGE_SIZE: 3) {
        Books {
          _id
          title
        }
      }
    }`
}))
class BasicQuery extends Component {
  render() {
    let { loading, loaded, data } = this.props;
    return (
      <div>
        {loading ? <div>LOADING</div> : null}
        {loaded ? <div>LOADED</div> : null}
        {data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
      </div>
    );
  }
}

class TestingSandbox1 extends Component {
  state = { page: 1 };
  render() {
    return (
      <div>
        <button onClick={() => this.setState({ page: this.state.page - 1 })}>Prev</button>
        <button onClick={() => this.setState({ page: this.state.page + 1 })}>Next</button>
        <BasicQuery page={this.state.page} />
      </div>
    );
  }
}

render(<TestingSandbox1 />, document.getElementById("home1"));
