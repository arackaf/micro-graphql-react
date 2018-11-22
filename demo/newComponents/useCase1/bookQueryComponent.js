import React, { Component, Fragment } from "react";
import { GraphQL, buildQuery } from "../../../index-local";
import { BOOKS_QUERY } from "../../savedQueries";

export class BookQueryComponent extends Component {
  render() {
    return (
      <div>
        <GraphQL query={{ books: buildQuery(BOOKS_QUERY, { page: this.props.page }) }}>
          {({ books: { data } }) =>
            data ? (
              <ul>
                {data.allBooks.Books.map(b => (
                  <li key={b._id}>{b.title}</li>
                ))}
              </ul>
            ) : null
          }
        </GraphQL>
      </div>
    );
  }
}
