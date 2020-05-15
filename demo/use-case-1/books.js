import React from "react";
import { BOOKS_QUERY } from "../savedQueries";
import { useQuery, buildQuery } from "../../src/index";

export const Books = props => {
  const { data, loading } = useQuery(buildQuery(BOOKS_QUERY, {}));
  const books = data?.allBooks?.Books ?? [];

  return <div>{loading ? <span>Loading ...</span> : books.map(book => <div>{book.title}</div>)}</div>;
};
