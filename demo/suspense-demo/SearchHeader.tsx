import React, { useMemo, useState, useEffect, useRef } from "react";
import FlowItems from "./layout/FlowItems";
import { getSearchState, setSearchValues, history } from "./util/history-utils";
import Modal from "./ui/Modal";
import { RemovableLabelDisplay } from "./ui/LabelDisplay";

const PAGE_SIZE = 10;

export const SearchHeaderDisabled = () => {
  const [{ page, search }, setSearchState] = useState(() => getSearchState());

  return (
    <FlowItems containerStyle={{ alignItems: "center" }} tighter={true}>
      <a
        className="disabled"
        style={{ fontSize: "24px", alignSelf: "center", cursor: "not-allowed" }}
      >
        <i className="fa fa-question-circle"></i>
      </a>
      <div className="btn-group">
        <button disabled={true} className="btn btn-default">
          <i className="fal fa-angle-double-left"></i>
        </button>

        <button disabled={true} className="btn btn-default">
          <i className="fal fa-angle-left"></i>
        </button>
      </div>
      <span style={{ alignSelf: "center" }}>Page {page} of</span>
      <button disabled={true} className="btn btn-default">
        <i className="fal fa-angle-right"></i>
      </button>
      <input
        disabled={true}
        style={{ width: "150px" }}
        className="form-control"
        defaultValue={search}
      />
      {search ? (
        <RemovableLabelDisplay
          style={{ alignSelf: "center" }}
          item={{ name: search }}
          doRemove={() => {}}
        />
      ) : null}
      Cache Update
      <select
        disabled={true}
        className="form-control"
        style={{ display: "inline" }}
      >
        <option value="hard">Hard Reset</option>
        <option value="soft">Soft Reset</option>
        <option value="cache">Cache Update</option>
      </select>
    </FlowItems>
  );
};
const SearchHeader = ({ bookData, loading, mutationUpdate }) => {
  const [infoOpen, setInfoOpen] = useState(false);
  // normally there'd be one search state that'd be passed down, but I'm duplicating it here to make it easier for users to quickly
  // page results to help stress the suspense functionality (ie make sure only the most recent results ever show up on screen)
  const [{ page, search }, setSearchState] = useState(() => getSearchState());

  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current.value = search || "";
  }, [search]);

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
    <>
      <FlowItems containerStyle={{ alignItems: "center" }} tighter={true}>
        <a
          onClick={() => setInfoOpen(true)}
          style={{ fontSize: "24px", alignSelf: "center", color: "var(--primary-5)" }}
        >
          <i className="fa fa-question-circle"></i>
        </a>
        <div className="btn-group">
          <button
            disabled={page == 1}
            onClick={() => setSearchValues({ page: "" })}
            className="btn btn-default"
          >
            <i className="fal fa-angle-double-left"></i>
          </button>
          <button onClick={pageDown} className="btn btn-default">
            <i className="fal fa-angle-left"></i>
          </button>
        </div>
        <span style={{ alignSelf: "center" }}>
          Page {page} of {totalPages}
        </span>
        <button onClick={pageUp} className="btn btn-default">
          <i className="fal fa-angle-right"></i>
        </button>
        <input
          onKeyDown={(evt: any) =>
            evt.keyCode == 13 && setSearchValues({ page: "", search: evt.target.value })
          }
          style={{ width: "150px" }}
          className="form-control"
          defaultValue={search}
          ref={inputRef}
        />
        {search ? (
          <RemovableLabelDisplay
            style={{ alignSelf: "center" }}
            item={{ name: search }}
            doRemove={() => setSearchValues({ page: "", search: "" })}
          />
        ) : null}
        Cache Update
        <select
          disabled={loading}
          onChange={(evt: any) => (mutationUpdate.current = evt.target.value)}
          className="form-control"
          style={{ display: "inline" }}
        >
          <option value="hard">Hard Reset</option>
          <option value="soft">Soft Reset</option>
          <option value="cache">Cache Update</option>
        </select>
      </FlowItems>
      <Modal isOpen={infoOpen} onHide={() => setInfoOpen(false)} headerCaption={"Suspense Demo"}>
        <div className="x-alert x-alert-info">
          <p>
            This is a demo of micro-graphql-react's Suspense integration. Changing the search value
            and page number will trigger a new search with the useTransition hook; however, it will set the
            current search state immediately (without useTransition) in the search header. When the data come in, 
            the search state in the green box will update.
          </p>

          <p>
            This would normally make for a bad ui, but in this case you'll be able to immediately see the most recent search, as well as what the 
            currently displaying filters are.  You can slow the netork speed in Chrome's dev tools to quickly change search states, and confirm
            that the right end state winds up displaying.
          </p>

          <p>
            When this page starts up, pages 5 and 7 of the initial query will preload. So if you'd like to see pending searches immediately cancel, 
            and be replaced with cached data, slow your network spead, then page up to 5, the loading state should immediately stop, and show page with, 
            with no other updates. 
          </p>
        </div>
      </Modal>
    </>
  );
};

export default SearchHeader;
