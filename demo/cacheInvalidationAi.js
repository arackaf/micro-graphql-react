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

const hardResetStrategy = name => ({
  when: new RegExp(`(update|create|delete)${name}s?`),
  run: (args, resp, { hardReset }) => hardReset()
});

@query(BOOKS_QUERY, props => ({ page: props.page }), { onMutation: hardResetStrategy("Book") })
export class BookQueryComponent extends Component {
  render() {
    let { data } = this.props;
    return <div>{data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}</div>;
  }
}

@query(SUBJECTS_QUERY, props => ({ page: props.page }), { onMutation: hardResetStrategy("Subject") })
export class SubjectQueryComponent extends Component {
  render() {
    let { data } = this.props;
    return <div>{data ? <ul>{data.allSubjects.Subjects.map(subject => <li key={subject._id}>{subject.name}</li>)}</ul> : null}</div>;
  }
}
