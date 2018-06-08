import React, { Component, Fragment } from "react";
import { Client, query, mutation, setDefaultClient } from "../index-local";

@query(
  `
  query ALL_BOOKS ($page: Int) {
    allBooks(PAGE: $page, PAGE_SIZE: 3) {
      Books {
        _id
        title
      }
    }
  }`,
  props => ({ page: props.page })
)
export default class BasicQuery extends Component {
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
