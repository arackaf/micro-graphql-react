import React, { Component, Fragment } from "react";
import { GraphQL, buildQuery, buildMutation } from "../../index-local";
import { BOOKS_QUERY, MODIFY_BOOK_TITLE, MODIFY_BOOK_PAGE, BOOK_DELETE } from "../savedQueries";
import { hardResetStrategy } from "./strategies";

export const BookQueryComponent1 = props => (
  <div>
    <GraphQL
      query={{
        books: buildQuery(
          BOOKS_QUERY,
          { page: props.page },
          {
            onMutation: {
              when: "deleteBook",
              run: ({ cache, refresh }, mutationResponse, args) => {
                cache.entries.forEach(([key, results]) => {
                  results.data.allBooks.Books = results.data.allBooks.Books.filter(b => b._id != args._id);
                });
                refresh();
              }
            }
          }
        )
      }}
    >
      {({ books: { data } }) =>
        data ? (
          <ul>
            {data.allBooks.Books.map(b => (
              <li key={b._id}>
                {b.title} - {b.pages}
              </li>
            ))}
          </ul>
        ) : null
      }
    </GraphQL>
  </div>
);

//-------------------------------------------------------------------------------------------------

export class BookEditing extends Component {
  state = { editingId: "", editingOriginaltitle: "" };
  edit = book => {
    this.setState({ editingId: book._id, editingOriginaltitle: book.title, editingOriginalpages: book.pages });
  };
  render() {
    let { editingId, editingOriginaltitle, editingOriginalpages } = this.state;
    return (
      <GraphQL
        query={{ books: buildQuery(BOOKS_QUERY, { page: this.props.page }) }}
        mutation={{
          titleMutation: buildMutation(MODIFY_BOOK_TITLE),
          pagesMutation: buildMutation(MODIFY_BOOK_PAGE),
          deleteBook: buildMutation(BOOK_DELETE)
        }}
      >
        {({ books: { loading, loaded, data }, titleMutation, pagesMutation, deleteBook }) => (
          <div>
            {loading ? <div>LOADING</div> : null}
            {loaded ? <div>LOADED</div> : null}
            {data ? (
              <ul>
                {data.allBooks.Books.map(book => (
                  <li key={book._id}>
                    {book.title}
                    <button onClick={() => this.edit(book)}> edit</button>
                    <button onClick={() => deleteBook.runMutation({ _id: book._id })}> delete</button>
                  </li>
                ))}
              </ul>
            ) : null}

            {editingId ? (
              <Fragment>
                {titleMutation.running ? <div>RUNNING</div> : null}
                {titleMutation.finished ? <div>SAVED</div> : null}
                <input defaultValue={editingOriginaltitle} ref={el => (this.el = el)} placeholder="New title here!" />
                <button onClick={() => titleMutation.runMutation({ _id: editingId, title: this.el.value })}>Save</button>

                {pagesMutation.running ? <div>RUNNING</div> : null}
                {pagesMutation.finished ? <div>SAVED</div> : null}
                <input defaultValue={editingOriginalpages} ref={el => (this.elPages = el)} placeholder="New pages here!" />
                <button onClick={() => pagesMutation.runMutation({ _id: editingId, pages: +this.elPages.value })}>Save</button>
              </Fragment>
            ) : null}
          </div>
        )}
      </GraphQL>
    );
  }
}
