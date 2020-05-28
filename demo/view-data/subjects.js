import React, { useState } from "react";
import { SUBJECTS_QUERY } from "../savedQueries";
import { useQuery } from "../../src/index";
import { useHardResetQuery, useSubjectHardResetQuery } from "../cache-helpers/hard-reset-hooks";
import { useSoftResetQuery, useSubjectSoftResetQuery } from "../cache-helpers/soft-reset-hook";
import { RenderPaging } from "../util";

//HARD RESET
// const { data, loading } = useQuery(
//   SUBJECTS_QUERY,
//   { page },
//   { onMutation: { when: /(update|create|delete)Subjects?/, run: ({ hardReset }) => hardReset() } }
// );
// const { data, loading } = useHardResetQuery("Subject", SUBJECTS_QUERY, { page });
// const { data, loading } = useSubjectHardResetQuery(SUBJECTS_QUERY, { page });

// ------------------------

//SOFT RESET
// const { data, loading } = useQuery(
//   SUBJECTS_QUERY,
//   { page },
//   {
//     onMutation: {
//       when: /updateSubjects?/,
//       run: ({ softReset, currentResults }, resp) => {
//         const updatedSubjects = resp.updateSubjects?.Subjects ?? [resp.updateSubject.Subject];
//         updatedSubjects.forEach(subject => {
//           let CachedSubject = currentResults.allSubjects.Subjects.find(s => s._id == subject._id);
//           CachedSubject && Object.assign(CachedSubject, subject);
//         });
//         softReset(currentResults);
//       },
//     },
//   }
// );
// const { data, loading } = useSoftResetQuery("Subject", SUBJECTS_QUERY, { page });
// const { data, loading } = useSubjectSoftResetQuery(SUBJECTS_QUERY, { page });

// ------------------------

//MANUAL CACHE UPDATE


export default props => {
  const [page, setPage] = useState(1);
  const { data, loading } = useSubjectSoftResetQuery(SUBJECTS_QUERY, { page });

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
