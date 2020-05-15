import GraphQLJSON from "graphql-type-json";

import Book, { Book as BookRest } from "./Book/resolver";
import Subject, { Subject as SubjectRest } from "./Subject/resolver";

const { Query: BookQuery, Mutation: BookMutation } = Book;
const { Query: SubjectQuery, Mutation: SubjectMutation } = Subject;

export default {
  JSON: GraphQLJSON,
  Query: Object.assign({}, BookQuery, SubjectQuery),
  Mutation: Object.assign({}, BookMutation, SubjectMutation),
  Book: { ...BookRest },
  Subject: { ...SubjectRest }
};
