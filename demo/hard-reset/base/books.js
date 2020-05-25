import React, { useState } from "react";
import { BOOKS_QUERY } from "../../savedQueries";
import { useQuery, buildQuery } from "../../../src/index";

export const Books = props => {
  const [page, setPage] = useState(1);
  const { data, loading } = useQuery(
    buildQuery(
      BOOKS_QUERY,
      { page },
      { onMutation: { when: /(update|create|delete)Books?/, run: ({ hardReset }) => hardReset() } }
    )
  );
  const books = data?.allBooks?.Books ?? [];

  return (
    <div>
      <div>
        {books.map(book => (
          <div key={book._id}>{book.title}</div>
        ))}
        <button disabled={page == 1} onClick={() => setPage(page => page - 1)}>
          Prev
        </button>
        {page}
        <button onClick={() => setPage(page => page + 1)}>Next</button>
      </div>
      {loading ? <span>Loading ...</span> : null}
    </div>
  );
};
