import React, { Component, Fragment } from "react";
import { query, mutation } from "../index-local";
import { BOOKS_QUERY, BOOKS_MUTATION, SUBJECTS_QUERY, SUBJECTS_MUTATION } from "./savedQueries";

const standardUpdateSingleStrategy = name => ({
  when: `update${name}`,
  run: (args, { [`update${name}`]: { [name]: updatedItem } }, { softReset, currentResults }) => {
    let CachedItem = currentResults[`all${name}s`][`${name}s`].find(x => x._id == updatedItem._id);
    CachedItem && Object.assign(CachedItem, updatedItem);
    softReset(currentResults);
  }
});

@query(BOOKS_QUERY, props => ({ page: props.page }), { onMutation: standardUpdateSingleStrategy("Book") })
export class BookQueryComponent extends Component {
  render() {
    let { data } = this.props;
    return <div>{data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}</div>;
  }
}

@query(SUBJECTS_QUERY, props => ({ page: props.page }), { onMutation: standardUpdateSingleStrategy("Subject") })
export class SubjectQueryComponent extends Component {
  render() {
    let { data } = this.props;
    return <div>{data ? <ul>{data.allSubjects.Subjects.map(subject => <li key={subject._id}>{subject.name}</li>)}</ul> : null}</div>;
  }
}
