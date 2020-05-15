import React, { Component, Fragment } from "react";
import { render } from "react-dom";
import { Client, setDefaultClient, useQuery, buildQuery } from "../src/index";

import { Books } from "./use-case-1/books";

import { BOOKS_QUERY, SUBJECTS_QUERY } from "./savedQueries";

const client = new Client({
  endpoint: "https://mylibrary.io/graphql-public"
});

setDefaultClient(client);

const Home = props => {
  const { data, loading } = useQuery(buildQuery(BOOKS_QUERY, {}));
  const books = data?.allBooks?.Books ?? [];

  return (
    <div>
      <Books />
    </div>
  );
};

render(<Home />, document.getElementById("home1"));
