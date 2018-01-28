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
      allBooks(PAGE: 1, PAGE_SIZE: 3) {
        Books {
          _id
          title
        }
      }
    }`
}))
class TestingSandbox extends Component {
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

render(<TestingSandbox />, document.getElementById("home"));
