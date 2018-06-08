import React, { Component, Fragment } from "react";
import { query, mutation } from "../index-local";
import { BOOKS_QUERY, BOOKS_MUTATION, SUBJECTS_QUERY, SUBJECTS_MUTATION } from "./savedQueries";

@query(BOOKS_QUERY, props => ({ page: props.page }), {
  onMutation: {
    when: "updateBook",
    run: (args, { updateBook: { Book } }, { softReset, currentResults }) => {
      let CachedBook = currentResults.allBooks.Books.find(b => b._id == Book._id);
      CachedBook && Object.assign(CachedBook, Book);
      softReset(currentResults);
    }
  }
})
export class BookQueryComponent extends Component {
  render() {
    let { data } = this.props;
    return <div>{data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}</div>;
  }
}

@query(SUBJECTS_QUERY, props => ({ page: props.page }), {
  onMutation: {
    when: "updateSubject",
    run: (args, { updateSubject: { Subject } }, { softReset, currentResults }) => {
      let CachedSubject = currentResults.allSubjects.Subjects.find(s => s._id == Subject._id);
      CachedSubject && Object.assign(CachedSubject, Subject);
      softReset(currentResults);
    }
  }
})
export class SubjectQueryComponent extends Component {
  render() {
    let { data } = this.props;
    return <div>{data ? <ul>{data.allSubjects.Subjects.map(subject => <li key={subject._id}>{subject.name}</li>)}</ul> : null}</div>;
  }
}
