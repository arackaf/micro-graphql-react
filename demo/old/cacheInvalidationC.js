import React, { Component, Fragment } from "react";
import { query, mutation } from "../index-local";
import { BOOKS_QUERY, BOOKS_MUTATION, SUBJECTS_QUERY, SUBJECTS_MUTATION } from "../savedQueries";

import parse from "url-parse";

@query(BOOKS_QUERY, props => ({ page: props.page }), {
  onMutation: {
    when: "deleteBook",
    run: (args, mutationResponse, { cache, refresh }) => {
      cache.entries.forEach(([key, results]) => {
        results.data.allBooks.Books = results.data.allBooks.Books.filter(b => b._id != args._id);
      });
      refresh();
    }
  }
})
export class BookQueryComponent extends Component {
  render() {
    let { data } = this.props;
    return <div>{data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}</div>;
  }
}
