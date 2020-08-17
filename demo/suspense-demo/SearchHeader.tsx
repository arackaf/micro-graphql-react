import React, { useMemo, useState, useEffect } from "react";
import FlowItems from "./layout/FlowItems";
import { getSearchState, setSearchValues, history } from "./util/history-utils";

const PAGE_SIZE = 10;

const SearchHeader = ({ bookData }) => {
  const [{ page }, setSearchState] = useState(() => getSearchState());

  useEffect(() => {
    return history.listen(() => setSearchState(getSearchState()));
  }, []);

  const booksCount = bookData?.allBooks?.Meta?.count ?? "";

  const resultsCount = booksCount != null ? booksCount : -1;
  const totalPages = useMemo(
    () => (resultsCount && resultsCount > 0 ? Math.ceil(resultsCount / PAGE_SIZE) : 0),
    [resultsCount]
  );

  const pageDown = () => setSearchValues({ page: page == 2 ? "" : page - 1 });
  const pageUp = () => setSearchValues({ page: page == "" ? 2 : +page + 1 });

  return (
    <FlowItems tighter={true}>
      <button onClick={pageDown} className="btn btn-default">
        <i className="fal fa-angle-left"></i>
      </button>
      <span style={{ alignSelf: "center" }}>Page {page} of {totalPages}</span>
      <button onClick={pageUp} className="btn btn-default">
        <i className="fal fa-angle-right"></i>
      </button>
    </FlowItems>
  );
};

export default SearchHeader;
