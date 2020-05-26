import React, { useState } from "react";
import { SUBJECTS_QUERY } from "./savedQueries";
import { useQuery } from "../src/index";
import { useHardResetQuery, useSubjectHardResetQuery } from "./cache-helpers/hard-reset-hooks";
import { RenderPaging } from "./util";

//HARD RESET
// const { data, loading } = useQuery(
//   SUBJECTS_QUERY,
//   { page },
//   { onMutation: { when: /(update|create|delete)Subjects?/, run: ({ hardReset }) => hardReset() } }
// );
// const { data, loading } = useHardResetQuery("Subject", SUBJECTS_QUERY, { page });
// const { data, loading } = useSubjectHardResetQuery(SUBJECTS_QUERY, { page });

// ------------------------

export const Subjects = props => {
  const [page, setPage] = useState(1);
  const { data, loading } = useSubjectHardResetQuery(SUBJECTS_QUERY, { page });

  const subjects = data?.allSubjects?.Subjects ?? [];

  return (
    <div>
      <div>
        {subjects.map(subject => (
          <div key={subject._id}>{subject.name}</div>
        ))}
      </div>
      <RenderPaging page={page} setPage={setPage} />
      {loading ? <span>Loading ...</span> : null}
    </div>
  );
};
