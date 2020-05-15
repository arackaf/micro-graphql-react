import React, { Component, Fragment } from "react";
import { Client, query, mutation, setDefaultClient } from "../index-local";

@query(
  `
    query ALL_BOOKS($title_contains: String) {
      allBooks(title_contains: $title_contains, SORT: {title: 1}, PAGE_SIZE: 1, PAGE: 1) {
        Books {
          _id
          title
        }
      }
    }`,
  props => ({ title_contains: props.title_contains }),
  { mapProps: props => ({ firstBookProps: props }), cacheSize: 3 }
)
@query(
  `
  query ALL_BOOKS($title_contains: String) {
    allBooks(title_contains: $title_contains, SORT: {title: -1}, PAGE_SIZE: 1, PAGE: 1) {
      Books {
        _id
        title
      }
    }
  }`,
  props => ({ title_contains: props.title_contains }),
  { mapProps: props => ({ lastBookProps: props }), cacheSize: 3 }
)
export default class TwoQueries extends Component {
  render() {
    let { firstBookProps, lastBookProps } = this.props;
    return (
      <div>
        {firstBookProps.loading || lastBookProps.loading ? <div>LOADING</div> : null}
        {firstBookProps.loaded || lastBookProps.loaded ? <div>LOADED</div> : null}
        {firstBookProps.data ? <ul>{firstBookProps.data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
        {lastBookProps.data ? <ul>{lastBookProps.data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
      </div>
    );
  }
}
