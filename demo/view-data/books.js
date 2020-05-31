import React, { useState } from "react";
import { BOOKS_QUERY } from "../savedQueries";
import { useQuery, getDefaultClient } from "../../src/index";
import { useHardResetQuery, useBookHardResetQuery } from "../cache-helpers/hard-reset-hooks";
import { RenderPaging } from "../util";
import { useSoftResetQuery, useBookSoftResetQuery } from "../cache-helpers/soft-reset-hook";
import { syncQueryToCache } from "../cache-helpers/manual-cache-helpers";

//HARD RESET
// const { data, loading } = useQuery(
//   BOOKS_QUERY,
//   { page },
//   { onMutation: { when: /(update|create|delete)Books?/, run: ({ hardReset }) => hardReset() } }
// );
// const { data, loading } = useHardResetQuery("Book", BOOKS_QUERY, { page });
// const { data, loading } = useBookHardResetQuery(BOOKS_QUERY, { page });

// ------------------------

//SOFT RESET
// const { data, loading } = useQuery(
//   BOOKS_QUERY,
//   { page },
//   {
//     onMutation: {
//       when: /updateBooks?/,
//       run: ({ softReset, currentResults }, resp) => {
//         const updatedBooks = resp.updateBooks?.Books ?? [resp.updateBook.Book];
//         updatedBooks.forEach(book => {
//           let CachedBook = currentResults.allBooks.Books.find(b => b._id == book._id);
//           CachedBook && Object.assign(CachedBook, book);
//         });
//         softReset(currentResults);
//       },
//     },
//   }
// );
// const { data, loading } = useSoftResetQuery("Book", BOOKS_QUERY, { page });
// const { data, loading } = useBookSoftResetQuery(BOOKS_QUERY, { page });

// -------------------------

// MANUAL CACHE UPDATE

// const graphQLClient = getDefaultClient();

// const syncCollection = (current, newResultsLookup) => {
//   return current.map(item => {
//     const updatedItem = newResultsLookup.get(item._id);
//     return updatedItem ? Object.assign({}, item, updatedItem) : item;
//   });
// };

// graphQLClient.subscribeMutation([
//   {
//     when: /updateBooks?/,
//     run: ({ refreshActiveQueries }, resp, variables) => {
//       const cache = graphQLClient.getCache(BOOKS_QUERY);
//       const newResults = resp.updateBook ? [resp.updateBook.Book] : resp.updateBooks.Books;
//       const newResultsLookup = new Map(newResults.map(item => [item._id, item]));

//       for (let [uri, { data }] of cache.entries) {
//         data["allBooks"]["Books"] = syncCollection(data["allBooks"]["Books"], newResultsLookup);
//       }

//       refreshActiveQueries(BOOKS_QUERY);
//     }
//   }
// ]);

syncQueryToCache(BOOKS_QUERY, "Book");

// ------------------------------

export default props => {
  const [page, setPage] = useState(1);
  const { data, loading } = useQuery(BOOKS_QUERY, { page });

  const books = data?.allBooks?.Books ?? [];

  return (
    <div>
      <div>
        {books.map(book => (
          <div key={book._id}>{book.title}</div>
        ))}
      </div>
      <RenderPaging page={page} setPage={setPage} />
      {loading ? <span>Loading ...</span> : null}
    </div>
  );
};
