import React, { Component, Fragment } from "react";
import { query, mutation } from "../index-local";
import {
  BOOKS_QUERY,
  BOOKS_MUTATION,
  BOOKS_MUTATION_MULTI,
  BOOK_CREATE,
  BOOK_DELETE,
  SUBJECTS_QUERY,
  SUBJECTS_MUTATION,
  SUBJECTS_MUTATION_MULTI,
  SUBJECT_CREATE,
  SUBJECT_DELETE
} from "./savedQueries";

@query(BOOKS_QUERY, props => ({ page: props.page }), {
  onMutation: { when: /(update|create|delete)Books?/, run: (args, resp, { hardReset }) => hardReset() }
})
export class BookQueryComponent extends Component {
  render() {
    let { data } = this.props;
    return <div>{data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}</div>;
  }
}

@query(BOOKS_QUERY, props => ({ page: props.page }))
@mutation(BOOKS_MUTATION, { mapProps: props => ({ singleMutation: props }) })
@mutation(BOOKS_MUTATION_MULTI, { mapProps: props => ({ multiMutation: props }) })
@mutation(BOOK_CREATE, { mapProps: props => ({ bookCreation: props }) })
@mutation(BOOK_DELETE, { mapProps: props => ({ bookDeletion: props }) })
export class BookGruntWork extends Component {
  state = { editingId: "", editingOriginaltitle: "" };
  edit = book => this.setState({ editingId: book._id, editingOriginaltitle: book.title, editingOriginalpages: book.pages });
  cancel = () => this.setState({ editingId: null });

  saveSingle = () => {
    this.props.multiMutation.runMutation({ _ids: this.state.editingId, title: this.el.value, pages: +this.elPages.value }).then(this.cancel);
  };
  saveMulti = () => {
    this.props.multiMutation.runMutation({ _ids: [this.state.editingId], title: this.el.value, pages: +this.elPages.value }).then(this.cancel);
  };

  runCreate = () => {
    this.props.bookCreation.runMutation({ Book: { title: this.newBookTitleEl.value, pages: this.newBookPagesEl.value } }).then(this.cancel);
  };

  render() {
    let { data, singleMutation, multiMutation, bookCreation, bookDeletion } = this.props;
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
        New Book:
        <input ref={el => (this.newBookTitleEl = el)} />
        <input ref={el => (this.newBookPagesEl = el)} />
        <br />
        <button onClick={this.runCreate}>CREATE</button>
        <br />
        {editingId ? (
          <Fragment>
            <input defaultValue={editingOriginaltitle} style={{ width: "300px" }} ref={el => (this.el = el)} placeholder="New title here!" />
            <input defaultValue={editingOriginalpages} ref={el => (this.elPages = el)} placeholder="New pages here!" />
            <button onClick={this.saveSingle}>Save single</button>
            <button onClick={this.saveMulti}>Save multi</button>
            <button onClick={() => bookDeletion.runMutation({ _id: editingId }).then(this.cancel)}>DELETE</button>
            <button onClick={this.cancel}>Cancel</button>
          </Fragment>
        ) : null}
      </div>
    );
  }
}

@query(SUBJECTS_QUERY, props => ({ page: props.page }), {
  onMutation: { when: /(update|create|delete)Subjects?/, run: (args, resp, { hardReset }) => hardReset() }
})
export class SubjectQueryComponent extends Component {
  render() {
    let { data } = this.props;
    return <div>{data ? <ul>{data.allSubjects.Subjects.map(subject => <li key={subject._id}>{subject.name}</li>)}</ul> : null}</div>;
  }
}

@query(SUBJECTS_QUERY, props => ({ page: props.page }))
@mutation(SUBJECTS_MUTATION, { mapProps: props => ({ singleMutation: props }) })
@mutation(SUBJECTS_MUTATION_MULTI, { mapProps: props => ({ multiMutation: props }) })
@mutation(SUBJECT_CREATE, { mapProps: props => ({ subjectCreation: props }) })
@mutation(SUBJECT_DELETE, { mapProps: props => ({ subjectDeletion: props }) })
export class SubjectGruntWork extends Component {
  state = { editingId: "", editingOriginalName: "" };
  edit = subject => this.setState({ editingId: subject._id, editingOriginalName: subject.name });
  cancel = () => this.setState({ editingId: null });

  saveSingle = () => {
    this.props.singleMutation.runMutation({ _id: this.state.editingId, name: this.el.value }).then(this.cancel);
  };
  saveMulti = () => {
    this.props.multiMutation.runMutation({ _ids: [this.state.editingId], name: this.el.value }).then(this.cancel);
  };

  runCreate = () => {
    this.props.subjectCreation.runMutation({ Subject: { name: this.newSubjectNameEl.value } }).then(this.cancel);
  };

  render() {
    let { data, singleMutation, multiMutation, subjectDeletion } = this.props;
    let { editingId, editingOriginalName } = this.state;
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
        New Subject:
        <input ref={el => (this.newSubjectNameEl = el)} />
        <br />
        <button onClick={this.runCreate}>CREATE</button>
        <br />
        {editingId ? (
          <Fragment>
            <input defaultValue={editingOriginalName} style={{ width: "300px" }} ref={el => (this.el = el)} placeholder="New title here!" />
            <button onClick={this.saveSingle}>Save single</button>
            <button onClick={this.saveMulti}>Save multi</button>
            <button onClick={() => subjectDeletion.runMutation({ _id: editingId }).then(this.cancel)}>DELETE</button>
            <button onClick={this.cancel}>Cancel</button>
          </Fragment>
        ) : null}
      </div>
    );
  }
}
