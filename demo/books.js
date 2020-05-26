import React, { useState } from "react";
import { BOOKS_QUERY } from "./savedQueries";
import { useQuery } from "../src/index";
import { useHardResetQuery, useBookHardResetQuery } from "./cache-helpers/hard-reset-hooks";
import { RenderPaging } from "./util";

//HARD RESET
// const { data, loading } = useQuery(
//   BOOKS_QUERY,
//   { page },
//   { onMutation: { when: /(update|create|delete)Books?/, run: ({ hardReset }) => hardReset() } }
// );
// const { data, loading } = useHardResetQuery("Book", BOOKS_QUERY, { page });
// const { data, loading } = useBookHardResetQuery(BOOKS_QUERY, { page });

// ------------------------

export const Books = props => {
  const [page, setPage] = useState(1);
  const { data, loading } = useBookHardResetQuery(BOOKS_QUERY, { page });

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
