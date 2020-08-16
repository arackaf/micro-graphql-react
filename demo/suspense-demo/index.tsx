import React, { Suspense } from "react";
import "../static/fontawesome/css/font-awesome-booklist-build.css";

import { useSuspenseQuery } from "../../src/index";
import { BOOKS_QUERY, ALL_SUBJECTS_QUERY } from "../savedQueries";
import { TableHeader, DisplayBooks } from "./data-display";

const SuspenseDemo = props => (
  <div id="app" style={{ margin: "15px" }}>
    <Suspense fallback={<DemoFallback />}>
      <ShowDemo />
    </Suspense>
  </div>
);

const DemoFallback = () => (
  <table className="table">
    <TableHeader />
    <tbody>
      <tr>
        <td colSpan={6}>
          <h1 className="fallback">
            LOADING <i className="fas fa-cog fa-spin"></i>
          </h1>
        </td>
      </tr>
    </tbody>
  </table>
);

const ShowDemo = props => {
  const { data: bookData } = useSuspenseQuery(BOOKS_QUERY, { title: "washington" });
  const { data: subjectData } = useSuspenseQuery(ALL_SUBJECTS_QUERY);

  return (
    <table className="table">
      <TableHeader />
      <DisplayBooks {...{ bookData, subjectData }} />
    </table>
  );
};

export default SuspenseDemo;
