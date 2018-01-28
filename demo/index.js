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

@query(client, props => ({
  query: `
    query ALL_BOOKS ($page: Int) {
      allBooks(PAGE: $page, PAGE_SIZE: 3) {
        Books {
          _id
          title
        }
      }
    }`,
  variables: {
    page: props.page
  }
}))
class BasicQueryWithVariables extends Component {
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

@query(client, props => ({
  query: `
    query ALL_BOOKS {
      ${props.page % 2 ? "allBooks" : "allBooksX"}(PAGE: ${props.page}, PAGE_SIZE: 3) {
        Books {
          _id
          title
        }
      }
    }`
}))
class BasicQueryWithError extends Component {
  render() {
    let { loading, loaded, data, error } = this.props;
    return (
      <div>
        {loading ? <div>LOADING</div> : null}
        {loaded ? <div>LOADED</div> : null}
        {data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
        {error ? (
          <div>
            {error
              .map(e => e.message)
              .join(",")
              .toString()}
          </div>
        ) : null}
      </div>
    );
  }
}

class TestingSandbox1 extends Component {
  state = { page: 1, shown: true };
  render() {
    return (
      <div>
        <button onClick={() => this.setState({ page: this.state.page - 1 })}>Prev</button>
        <button onClick={() => this.setState({ page: this.state.page + 1 })}>Next</button>
        <button onClick={() => this.setState({ shown: !this.state.shown })}>toggle</button>
        {this.state.shown ? <BasicQuery page={this.state.page} /> : null}
        {this.state.shown ? <BasicQueryWithVariables page={this.state.page} /> : null}
        {this.state.shown ? <BasicQueryWithError page={this.state.page} /> : null}
      </div>
    );
  }
}

render(<TestingSandbox1 />, document.getElementById("home1"));
