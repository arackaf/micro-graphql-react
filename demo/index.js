import React, { Component, Fragment } from "react";
import { render } from "react-dom";
import { Client, setDefaultClient, useQuery } from "../src/index";

import { Books } from "./books";
import { Subjects } from "./subjects";

import { BooksEdit } from "./books-edit";
import { SubjectsEdit } from "./subjects-edit";

import { BOOKS_QUERY, SUBJECTS_QUERY } from "./savedQueries";

const client = new Client({
  endpoint: "https://mylibrary.io/graphql-public",
  fetchOptions: { mode: "cors" }
});

setDefaultClient(client);

const Home = props => {
  return (
    <div>
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
    </div>
  );
};

render(<Home />, document.getElementById("home1"));
