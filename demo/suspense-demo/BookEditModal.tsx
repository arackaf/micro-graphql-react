import React, { useState, useEffect, useLayoutEffect, useRef } from "react";

import Modal from "./ui/Modal";
import FlexRow from "./layout/FlexRow";
import { useMutation } from "../../src";
import { MODIFY_BOOK_TITLE } from "../savedQueries";

const BookEditModal = ({ book, onHide }) => {
  const [bookEditing, setBookEditing] = useState(null);
  useLayoutEffect(() => {
    book && setBookEditing(book);
  }, [book]);

  const titleRef = useRef(null);
  const { runMutation, running } = useMutation(MODIFY_BOOK_TITLE);

  return (
    <Modal headerCaption="Edit Book" isOpen={!!book} onHide={onHide}>
      {bookEditing ? (
        <div>
          <FlexRow>
            <div className="col-xs-12">
              <div className="form-group">
                <label>Title</label>
                <input
                  ref={titleRef}
                  defaultValue={bookEditing.title}
                  placeholder="New title"
                  className="form-control"
                />
              </div>
            </div>
          </FlexRow>
          <br />
          <button disabled={running} className="btn btn-primary" onClick={() => runMutation({ _id: book._id, title: titleRef.current.value })}>Save</button>
        </div>
      ) : null}
    </Modal>
  );
};

export default BookEditModal;
