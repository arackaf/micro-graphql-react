import React, { Component, Fragment } from "react";
import { query, mutation } from "../index-local";
import { BOOKS_QUERY, BOOKS_MUTATION, SUBJECTS_QUERY, SUBJECTS_MUTATION } from "./savedQueries";

@query(BOOKS_QUERY, props => ({ page: props.page }), {
  onMutation: {
    when: "updateBook",
    run: ({ updateBook: { Book } }, { softReset, currentResults }) => {
      let CachedBook = currentResults.allBooks.Books.find(b => b._id == Book._id);
      CachedBook && Object.assign(CachedBook, Book);
      softReset(currentResults);
    }
  }
})
@mutation(BOOKS_MUTATION)
export class BookQueryComponent extends Component {
  state = { editingId: "", editingOriginaltitle: "" };
  edit = book => this.setState({ editingId: book._id, editingOriginaltitle: book.title, editingOriginalpages: book.pages });
  cancel = () => this.setState({ editingId: null });

  render() {
    let { data, runMutation } = this.props;
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
            <input defaultValue={editingOriginalpages} ref={el => (this.elPages = el)} placeholder="New pages here!" />
            <button onClick={() => runMutation({ _id: editingId, title: this.el.value, pages: +this.elPages.value }).then(this.cancel)}>Save</button>
            <button onClick={this.cancel}>Cancel</button>
          </Fragment>
        ) : null}
      </div>
    );
  }
}

@query(SUBJECTS_QUERY, props => ({ page: props.page }), {
  onMutation: {
    when: "updateSubject",
    run: ({ updateSubject: { Subject } }, { softReset, currentResults }) => {
      let CachedSubject = currentResults.allSubjects.Subjects.find(s => s._id == Subject._id);
      CachedSubject && Object.assign(CachedSubject, Subject);
      softReset(currentResults);
    }
  }
})
@mutation(SUBJECTS_MUTATION)
export class SubjectQueryComponent extends Component {
  state = { editingId: "", editingOriginalName: "" };
  edit = subject => this.setState({ editingId: subject._id, editingOriginalName: subject.name });
  cancel = () => this.setState({ editingId: null });

  render() {
    let { data, runMutation } = this.props;
    let { editingId, editingOriginalName, editingOriginalpages } = this.state;
    return (
      <div>
        {data ? (
          <ul>
            {data.allSubjects.Subjects.map(subject => (
              <li key={subject._id}>
                {subject.name}
                <button onClick={() => this.edit(subject)}> edit</button>
              </li>
            ))}
          </ul>
        ) : null}

        {editingId ? (
          <Fragment>
            <input defaultValue={editingOriginalName} style={{ width: "300px" }} ref={el => (this.el = el)} placeholder="New name here!" />
            <button onClick={() => runMutation({ _id: editingId, name: this.el.value }).then(this.cancel)}>Save</button>
            <button onClick={this.cancel}>Cancel</button>
          </Fragment>
        ) : null}
      </div>
    );
  }
}
