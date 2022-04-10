import React, { Suspense, useState, useEffect, useRef } from "react";
const { useTransition } = React as any;
import "../static/fontawesome/css/font-awesome-booklist-build.css";

import { useSuspenseQuery, getDefaultClient } from "../../src/index";
import { BOOKS_QUERY, ALL_SUBJECTS_QUERY } from "../savedQueries";
import { TableHeader, DisplayBooks } from "./data-display";
import SearchHeader, { SearchHeaderDisabled } from "./SearchHeader";

import BookEditModal from "./BookEditModal";

import queryString from "query-string";
import { getSearchState, history } from "./util/history-utils";

import Loading from "./ui/Loading";

const SuspenseDemo = props => {
  const [isPending, startTransition] = useTransition({ timeoutMs: 9000 });
  const [{ page, search }, setSearchState] = useState(() => getSearchState());

  useEffect(() => {
    return history.listen(() => startTransition(() => setSearchState(getSearchState())));
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
        {isPending ? <Loading /> : null}
        <DemoContent {...{ search, page, isPending, startTransition }} />
      </Suspense>
    </div>
  );
};

const DemoFallback = () => (
  <div>
    <SearchHeaderDisabled />
    <hr style={{ margin: "30px 0" }} />
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
  </div>
);

const DemoContent = ({ search, page, isPending, startTransition }) => {
  const mutationUpdate = useRef("hard");
  const { data: bookData, currentQuery } = useSuspenseQuery(
    BOOKS_QUERY,
    {
      title: search,
      page: +page
    },
    {
      onMutation: [
        {
          when: /updateBook/,
          run: ({ softReset, hardReset, currentResults, refresh, cache }, resp) => {
            if (mutationUpdate.current == "hard") {
              startTransition(() => {
                hardReset();
              });
            } else if (mutationUpdate.current == "soft") {
              const updatedBook = resp.updateBook.Book;
              const cachedBook = currentResults.allBooks.Books.find(b => b._id == updatedBook._id);
              cachedBook && Object.assign(cachedBook, updatedBook);

              softReset(currentResults);
            } else if (mutationUpdate.current == "cache") {
              const newResults = [resp.updateBook.Book];
              const newResultsLookup = new Map(newResults.map(item => [item._id, item]));

              for (let [uri, { data }] of cache.entries) {
                data["allBooks"]["Books"] = data["allBooks"]["Books"].map(item => {
                  const updatedItem = newResultsLookup.get(item._id);
                  return updatedItem ? Object.assign({}, item, updatedItem) : item;
                });
              }

              refresh();
            }
          }
        }
      ]
    }
  );
  const { data: subjectData } = useSuspenseQuery(ALL_SUBJECTS_QUERY);
  const [editingBook, setEditingBook] = useState(null);

  const { query } = queryString.parseUrl(currentQuery);
  const variables = eval(`(${query.variables})`);

  return (
    <div>
      <SearchHeader mutationUpdate={mutationUpdate} bookData={bookData} loading={isPending} />
      <hr style={{ margin: "30px 0" }} />

      <div className="alert alert-success margin-bottom" style={{ display: "inline-block" }}>
        <div>
          Data displayed: Page: {variables.page} Search: "{variables.title}"
        </div>
      </div>
      <table className="table">
        <TableHeader />
        <DisplayBooks {...{ bookData, subjectData, setEditingBook }} />
      </table>
      <BookEditModal book={editingBook} onHide={() => setEditingBook(null)} />
    </div>
  );
};

export default SuspenseDemo;
