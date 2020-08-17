import React, { useMemo, useState, useEffect } from "react";
import FlowItems from "./layout/FlowItems";
import { getSearchState, setSearchValues, history } from "./util/history-utils";
import Modal from "./ui/Modal";
import { RemovableLabelDisplay } from "./ui/LabelDisplay";

const PAGE_SIZE = 10;

const SearchHeader = ({ bookData }) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const [{ page, search }, setSearchState] = useState(() => getSearchState());

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
      <FlowItems tighter={true}>
        <a onClick={() => setInfoOpen(true)} style={{ fontSize: "24px", alignSelf: "center" }}>
          <i className="fa fa-question-circle"></i>
        </a>
        <button onClick={pageDown} className="btn btn-default">
          <i className="fal fa-angle-left"></i>
        </button>
        <span style={{ alignSelf: "center" }}>
          Page {page} of {totalPages}
        </span>
        <button onClick={pageUp} className="btn btn-default">
          <i className="fal fa-angle-right"></i>
        </button>
        <input
          onKeyDown={(evt: any) =>
            evt.keyCode == 13 && setSearchValues({ search: evt.target.value })
          }
          style={{ width: "150px" }}
          className="form-control"
          defaultValue={search}
        />
        {search ? (
          <RemovableLabelDisplay
            style={{ alignSelf: "center" }}
            item={{ name: search }}
            doRemove={() => setSearchValues({ search: "" })}
          />
        ) : null}
      </FlowItems>
      <Modal isOpen={infoOpen} onHide={() => setInfoOpen(false)} headerCaption={"Suspense Demo"}>
        <div className="x-alert x-alert-info">
          <p>
            This is demo shows the Suspense integration of this library. Changing the search value
            and page number will trigger a new search with the useTransition hook, and will set the
            current search state immediately (without useTransition).
          </p>

          <p>
            This would normally make for a bad ui, but in this case you'll be able to see each new
            search state as they updste, but you'll only see actual results for the most recent
            search, when the values come in. Be sure to slow the netork speed down in Chrome's dev
            tools to really see this in action.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default SearchHeader;
