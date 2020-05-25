import React, { useState } from "react";
import { SUBJECTS_QUERY } from "../savedQueries";
import { useQuery, buildQuery } from "../../src/index";
import { useHardResetQuery } from "./hard-reset-hooks";

export const Subjects = props => {
  const [page, setPage] = useState(1);
  // const { data, loading } = useQuery(
  //   buildQuery(
  //     SUBJECTS_QUERY,
  //     {},
  //     {
  //       onMutation: { when: /(update|create|delete)Subjects?/, run: ({ hardReset }) => hardReset() }
  //     }
  //   )
  // );

  const { data, loading } = useHardResetQuery("Subject", SUBJECTS_QUERY, {});

  const subjects = data?.allSubjects?.Subjects ?? [];

  return (
    <div>
      <div>
        {subjects.map(subject => (
          <div key={subject._id}>{subject.name}</div>
        ))}
      </div>
      {loading ? <span>Loading ...</span> : null}
    </div>
  );
};
