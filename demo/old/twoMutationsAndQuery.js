import React, { Component, Fragment } from "react";
import { Client, query, mutation, setDefaultClient } from "../index-local";

@query(
  `
    query ALL_BOOKS($page: Int) {
      allBooks(PAGE: $page, PAGE_SIZE: 3) {
        Books {
          _id
          title
          pages
        }
      }
    }`,
  props => ({ page: props.page })
)
@mutation(
  `mutation modifyBook($_id: String, $title: String) {
    updateBook(_id: $_id, Updates: { title: $title }) {
      success
    }
  }`,
  { mapProps: props => ({ titleMutation: props }) }
)
@mutation(
  `mutation modifyBook($_id: String, $pages: Int) {
    updateBook(_id: $_id, Updates: { pages: $pages }) {
      success
    }
  }`,
  { mapProps: props => ({ pagesMutation: props }) }
)
export default class TwoMutationsAndQuery extends Component {
  state = { editingId: "", editingOriginaltitle: "" };
  edit = book => {
    this.setState({ editingId: book._id, editingOriginaltitle: book.title, editingOriginalpages: book.pages });
  };
  render() {
    let { loading, loaded, data, titleMutation, pagesMutation } = this.props;

    let { editingId, editingOriginaltitle, editingOriginalpages } = this.state;
    return (
      <div>
        {loading ? <div>LOADING</div> : null}
        {loaded ? <div>LOADED</div> : null}
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
    );
  }
}
