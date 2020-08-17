import React, { Component, Fragment, lazy, Suspense } from "react";

import ReactDOM from "react-dom";
const { unstable_createRoot: createRoot } = ReactDOM;

import { Client, setDefaultClient, useQuery } from "../src/index";
import "@reach/dialog/styles.css";
import "./site-styles.scss";

import SuspenseDemo from "./suspense-demo/index"

const client = new Client({
  endpoint: "https://mylibrary.io/graphql-public",
  fetchOptions: { mode: "cors" }
});

setDefaultClient(client);

const Home = props => {
  return (
    <div>
      <SuspenseDemo />
    </div>
  );
};

createRoot(document.getElementById("home")).render(<Home />);
