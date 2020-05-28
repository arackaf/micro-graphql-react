import React, { Component, Fragment, lazy, Suspense } from "react";
import { render } from "react-dom";
import { Client, setDefaultClient, useQuery } from "../src/index";

const Books = lazy(() => import("./view-data/books"));
const Subjects = lazy(() => import("./view-data/subjects"));

import { BooksEdit } from "./edit-data/books-edit";
import { SubjectsEdit } from "./edit-data/subjects-edit";

import { BOOKS_QUERY, SUBJECTS_QUERY } from "./savedQueries";

const client = new Client({
  endpoint: "https://mylibrary.io/graphql-public",
  fetchOptions: { mode: "cors" }
});

setDefaultClient(client);

const Home = props => {
  return (
    <div>
      <Suspense fallback={<span>Loading...</span>}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div>
            <Books />
            <Subjects />
          </div>
          <div style={{ marginLeft: "40px" }}>
            <BooksEdit />
            <SubjectsEdit />
          </div>
        </div>
      </Suspense>
    </div>
  );
};

render(<Home />, document.getElementById("home1"));
