import Book from './Book/resolver';

const { Query: BookQuery, Mutation: BookMutation, ...BookRest } = Book;

export default {
  Query: Object.assign(
    {},
    BookQuery
  ),
  Mutation: Object.assign({},
    BookMutation
  ),
  ...BookRest
};

