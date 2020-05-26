import React from "react";

export const RenderPaging = ({ page, setPage }) => (
  <>
    <button disabled={page == 1} onClick={() => setPage(page => page - 1)}>
      Prev
    </button>
    {page}
    <button onClick={() => setPage(page => page + 1)}>Next</button>
  </>
);