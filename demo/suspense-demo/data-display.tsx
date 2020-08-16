import React, { Suspense, useMemo } from "react";

import { CoverSmall } from "./ui-helpers";
import { LabelDisplay } from "./LabelDisplay";

import FlexRow from "./layout/FlexRow";
import Stack from "./layout/Stack";
import FlowItems from "./layout/FlowItems";

import uiStyles from "./uiStyles.module.css";
import gridStyles from "./gridList.module.css";

const { bookTitle, bookAuthor } = uiStyles;
const { gridHoverFilter, detailsRow } = gridStyles;

export const TableHeader = () => (
  <thead>
    <tr>
      <th style={{ width: "100px" }} />
      <th style={{ minWidth: "200px" }}>Title</th>
      <th>Subjects</th>
      <th />
      <th>
        <a className="no-underline">Pages</a>
      </th>
      <th>
        <a className="no-underline">Added</a>
      </th>
      <th>Edit</th>
    </tr>
  </thead>
);

export const DisplayBooks = ({ bookData, subjectData }) => {
  const subjects = subjectData.allSubjects.Subjects;
  const books = bookData.allBooks.Books;
  const subjectLookup = useMemo(() => subjects.reduce((hash, s) => ((hash[s._id] = s), hash), {}), [
    subjects
  ]);

  const adjustedBooks = useMemo(
    () =>
      books.map(b => {
        let d = new Date(+b.dateAdded);
        return {
          ...b,
          subjects: b.subjects.map(s => subjectLookup[s]).filter(s => s),
          dateAddedDisplay: `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
        };
      }),
    [books, subjectLookup]
  );

  return (
    <tbody>
      {adjustedBooks.map(b => (
        <BookRow book={b} />
      ))}
    </tbody>
  );
};

export const BookRow = ({ book }) => {
  return (
    <tr>
      <td>
        <div style={{ minWidth: "75px", minHeight: "75px" }}>
          <CoverSmall url={book.smallImage} />
        </div>
      </td>
      <td>
        <Stack>
          <Stack tightest={true}>
            <div className={bookTitle}>{book.title}</div>
            {book.authors ? <div className={bookAuthor}>{book.authors.join(", ")}</div> : null}
          </Stack>
        </Stack>
      </td>
      <td>
        <div style={{ marginTop: "3px" }}>
          {book.subjects.map((s, i) => (
            <div key={i} style={{ marginBottom: "4px" }}>
              <LabelDisplay item={s} />
            </div>
          ))}
        </div>
      </td>
      <td>
        {book.publisher ? <div>{book.publisher}</div> : null}
        {book.publicationDate ? <div>{book.publicationDate}</div> : null}
        {book.isbn ? <div>{book.isbn}</div> : null}
      </td>
      <td>{book.pages}</td>
      <td>{book.dateAddedDisplay}</td>
      <td>
        <button className="btn btn-xs btn-primary">Edit</button>
      </td>
    </tr>
  );
};
