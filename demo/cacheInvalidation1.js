import React, { Component, Fragment } from "react";
import { Client, query, mutation, setDefaultClient } from "../index-local";

@query(
  `
    query ALL_BOOKS($page: Int) {
      allBooks(PAGE: $page, PAGE_SIZE: 3) {
        Books { _id title pages }
      }
    }`,
  props => ({ page: props.page }),
  {
    onMutation: {
      when: "updateBook",
      run: ({ updateBook: { Book } }, { softReset, currentResults }) => {
        let CachedBook = currentResults.allBooks.Books.find(b => b._id == Book._id);
        CachedBook && Object.assign(CachedBook, Book);
        softReset(currentResults);
      }
    }
  }
)
@mutation(
  `mutation modifyBook($_id: String, $title: String, $pages: Int) {
    updateBook(_id: $_id, Updates: { title: $title, pages: $pages }) {
      Book { _id, title, pages }
    }
  }`
)
export default class SoftResetCacheInvalidation extends Component {
  state = { editingId: "", editingOriginaltitle: "" };
  edit = book => this.setState({ editingId: book._id, editingOriginaltitle: book.title, editingOriginalpages: book.pages });
  render() {
    let { loading, loaded, data, running, finished, runMutation } = this.props;
    let { editingId, editingOriginaltitle, editingOriginalpages } = this.state;
    return (
      <div>
        {data ? (
          <ul>
            {data.allBooks.Books.map(book => (
              <li key={book._id}>
                {book.title}
                <button onClick={() => this.edit(book)}> edit</button>
              </li>
            ))}
          </ul>
        ) : null}

        {editingId ? (
          <Fragment>
            <input defaultValue={editingOriginaltitle} style={{ width: "300px" }} ref={el => (this.el = el)} placeholder="New title here!" />
            <button onClick={() => runMutation({ _id: editingId, title: this.el.value })}>Save</button>
            <br />
            <input defaultValue={editingOriginalpages} ref={el => (this.elPages = el)} placeholder="New pages here!" />
            <button onClick={() => runMutation({ _id: editingId, pages: +this.elPages.value })}>Save</button>
            <br />
            <button onClick={() => this.setState({ editingId: null })}>Cancel</button>

            {running ? <div>RUNNING</div> : null}
            {finished ? <div>SAVED</div> : null}
          </Fragment>
        ) : null}
      </div>
    );
  }
}
