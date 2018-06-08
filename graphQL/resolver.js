import Book from './Book/resolver';
import Subject from './Subject/resolver';

const { Query: BookQuery, Mutation: BookMutation, ...BookRest } = Book;
const { Query: SubjectQuery, Mutation: SubjectMutation, ...SubjectRest } = Subject;

export default {
  Query: Object.assign(
    {},
    BookQuery,
    SubjectQuery
  ),
  Mutation: Object.assign({},
    BookMutation,
    SubjectMutation
  ),
  ...BookRest,
  ...SubjectRest
};

