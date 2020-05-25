import React, { useState, useRef } from "react";
import { SUBJECTS_QUERY, SUBJECTS_MUTATION } from "../savedQueries";
import { useQuery, buildQuery, useMutation, buildMutation } from "../../src/index";

export const SubjectsEdit = props => {
  const [page, setPage] = useState(1);
  const { data, loading } = useQuery(
    buildQuery(
      SUBJECTS_QUERY,
      {},
      {
        onMutation: { when: /(update|create|delete)Subjects?/, run: ({ hardReset }) => hardReset() }
      }
    )
  );
  const subjects = data?.allSubjects?.Subjects ?? [];

  return (
    <div>
      <div>
        {subjects.map(subject => (
          <Subject key={subject._id} subject={subject} />
        ))}
      </div>
      {loading ? <span>Loading ...</span> : null}
    </div>
  );
};

const Subject = ({ subject }) => {
  const { runMutation } = useMutation(buildMutation(SUBJECTS_MUTATION));
  const inputRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const save = () => {
    runMutation({ _id: subject._id, name: inputRef.current.value }).then(() => setEditing(false));
  };

  return editing ? (
    <div>
      <input ref={inputRef} defaultValue={subject.name} />
      <button onClick={save}>Save</button>
    </div>
  ) : (
    <div>
      <span key={subject._id}>{subject.name}</span>
      <button onClick={() => setEditing(true)}>Edit</button>
    </div>
  );
};
