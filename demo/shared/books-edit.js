import React, { useState, useRef } from "react";
import { BOOKS_QUERY, MODIFY_BOOK_TITLE } from "../savedQueries";
import { useQuery, useMutation } from "../../src/index";

export const BooksEdit = props => {
  const [page, setPage] = useState(1);
  const { data, loading } = useQuery(
    BOOKS_QUERY,
    { page },
    { onMutation: { when: /(update|create|delete)Books?/, run: ({ hardReset }) => hardReset() } }
  );

  const books = data?.allBooks?.Books ?? [];

  return (
    <div>
      <div>
        {books.map(book => (
          <Book key={book._id} book={book} />
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

const Book = ({ book }) => {
  const { runMutation } = useMutation(MODIFY_BOOK_TITLE);
  const inputRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const save = () =>
    runMutation({ _id: book._id, title: inputRef.current.value }).then(() => setEditing(false));
  return (
    <div>
      {editing ? (
        <div>
          <input ref={inputRef} defaultValue={book.title} /> <button onClick={save}>Save</button>
        </div>
      ) : (
        <div>
          {book.title} <button onClick={() => setEditing(true)}>Edit</button>
        </div>
      )}
    </div>
  );
};
