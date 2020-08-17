import React, { useState, useEffect, useLayoutEffect } from "react";

import Modal from "./ui/Modal";
import FlexRow from "./layout/FlexRow";

const BookEditModal = ({ book, onHide }) => {
  const [bookEditing, setBookEditing] = useState(null);
  useLayoutEffect(() => {
    book && setBookEditing(book);
  }, [book]);
  return (
    <Modal headerCaption="Edit Book" isOpen={!!book} onHide={onHide}>
      {bookEditing ? (
        <div>
          <FlexRow>
            <div className="col-xs-12">
              <div className="form-group">
                <label>Title</label>
                <input
                  defaultValue={bookEditing.title}
                  placeholder="New title"
                  className="form-control"
                />
              </div>
            </div>
          </FlexRow>
        </div>
      ) : null}
    </Modal>
  );
};

export default BookEditModal;
