import React, { Suspense, useState, useEffect } from "react";
import "../static/fontawesome/css/font-awesome-booklist-build.css";

import { useSuspenseQuery, getDefaultClient } from "../../src/index";
import { BOOKS_QUERY, ALL_SUBJECTS_QUERY } from "../savedQueries";
import { TableHeader, DisplayBooks } from "./data-display";
import SearchHeader, { SearchHeaderDisabled } from "./SearchHeader";

import BookEditModal from "./BookEditModal";
import { getSearchState, history } from "./util/history-utils";

const SuspenseDemo = props => {
  const [{ page, search }, setSearchState] = useState(() => getSearchState());

  useEffect(() => {
    return history.listen(() => setSearchState(getSearchState()));
  }, []);

  const client = getDefaultClient();
  client.preload(BOOKS_QUERY, { title: search, page: +page });
  client.preload(ALL_SUBJECTS_QUERY);

  useEffect(() => {
    client.preload(BOOKS_QUERY, { title: search, page: 5 });
    client.preload(BOOKS_QUERY, { title: search, page: 7 });
  }, []);

  return (
    <div id="app" style={{ margin: "15px" }}>
      <Suspense fallback={<DemoFallback />}>
        <DemoContent {...{ search, page }} />
      </Suspense>
    </div>
  );
};

const DemoFallback = () => (
  <>
    <SearchHeaderDisabled />
    <table className="table">
      <TableHeader />
      <tbody>
        <tr style={{ backgroundColor: "white" }}>
          <td colSpan={6}>
            <h1 className="fallback">
              LOADING <i className="fas fa-cog fa-spin"></i>
            </h1>
          </td>
        </tr>
      </tbody>
    </table>
  </>
);

const DemoContent = ({ search, page }) => {
  const { data: bookData } = useSuspenseQuery(BOOKS_QUERY, { title: search, page: +page });
  const { data: subjectData } = useSuspenseQuery(ALL_SUBJECTS_QUERY);
  const [editingBook, setEditingBook] = useState(null);

  return (
    <div>
      <SearchHeader bookData={bookData} />
      <table className="table">
        <TableHeader />
        <DisplayBooks {...{ bookData, subjectData, setEditingBook }} />
      </table>
      <BookEditModal book={editingBook} onHide={() => setEditingBook(null)} />
    </div>
  );
};

export default SuspenseDemo;
