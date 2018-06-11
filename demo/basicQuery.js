import React, { Component, Fragment } from "react";
import { Client, query, compress } from "../index-local";

@query(
  compress`query ALL_BOOKS ($page: Int) {
    allBooks(PAGE: $page, PAGE_SIZE: 3) {
      Books { _id title }
    }
  }`,
  props => ({ page: props.page })
)
export default class BasicQuery extends Component {
  render() {
    let { loading, loaded, data } = this.props;
    let booksArr = data ? data.allBooks.Books : [];
    return (
      <div>
        {loading ? <div>LOADING</div> : null}
        {loaded ? <div>LOADED</div> : null}
        {data ? <ul>{booksArr.map(b => <li key={b._id}>{b.title}</li>)}</ul> : null}
      </div>
    );
  }
}
