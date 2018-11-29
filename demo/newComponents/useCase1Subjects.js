import React, { Component, Fragment } from "react";
import { GraphQL, buildQuery, buildMutation } from "../../index-local";
import {
  BOOKS_QUERY,
  MODIFY_BOOK_TITLE,
  MODIFY_BOOK_PAGE,
  SUBJECTS_MUTATION,
  SUBJECTS_MUTATION_MULTI,
  SUBJECT_CREATE,
  SUBJECT_DELETE,
  SUBJECTS_QUERY
} from "../savedQueries";
import { hardResetStrategy } from "./strategies";

export const SubjectQueryComponent1 = props => (
  <div>
    <GraphQL
      query={{
        subjects: buildQuery(
          SUBJECTS_QUERY,
          { page: props.page },
          { onMutation: { when: /(update|create|delete)Subjects?/, run: ({ hardReset }) => hardReset() } }
        )
      }}
    >
      {({ subjects: { data } }) =>
        data ? (
          <ul>
            {data.allSubjects.Subjects.map(s => (
              <li key={s._id}>{s.name}</li>
            ))}
          </ul>
        ) : null
      }
    </GraphQL>
  </div>
);

export const SubjectQueryComponent2 = props => (
  <div>
    <GraphQL query={{ subjects: buildQuery(SUBJECTS_QUERY, { page: props.page }, { onMutation: hardResetStrategy("Subject") }) }}>
      {({ subjects: { data } }) =>
        data ? (
          <ul>
            {data.allSubjects.Subjects.map(s => (
              <li key={s._id}>{s.name}</li>
            ))}
          </ul>
        ) : null
      }
    </GraphQL>
  </div>
);

//-------------------------------------------------------------------------------------------------

export class SubjectEditWork extends Component {
  state = { editingId: "", editingOriginalName: "" };
  edit = subject => this.setState({ editingId: subject._id, editingOriginalName: subject.name });
  cancel = () => this.setState({ editingId: null });

  render() {
    let { editingId, editingOriginalName } = this.state;
    return (
      <div>
        <GraphQL
          query={{ subjects: buildQuery(SUBJECTS_QUERY, { page: this.props.page }) }}
          mutation={{
            editSubject: buildMutation(SUBJECTS_MUTATION),
            editSubjectMulti: buildMutation(SUBJECTS_MUTATION_MULTI),
            createSubject: buildMutation(SUBJECT_CREATE),
            deleteSubject: buildMutation(SUBJECT_DELETE)
          }}
        >
          {({ subjects: { data }, editSubject, editSubjectMulti, createSubject, deleteSubject }) => (
            <div>
              {data && data.allSubjects ? (
                <ul>
                  {data.allSubjects.Subjects.map(subject => (
                    <li key={subject._id}>
                      {subject.name}
                      <button onClick={() => this.edit(subject)}> edit</button>
                    </li>
                  ))}
                </ul>
              ) : null}
              New Subject:
              <input ref={el => (this.newSubjectNameEl = el)} />
              <br />
              <button onClick={() => createSubject.runMutation({ Subject: { name: this.newSubjectNameEl.value } }).then(this.cancel)}>CREATE</button>
              <br />
              {editingId ? (
                <Fragment>
                  <input defaultValue={editingOriginalName} style={{ width: "300px" }} ref={el => (this.el = el)} placeholder="New title here!" />
                  <button onClick={() => editSubject.runMutation({ _id: this.state.editingId, name: this.el.value }).then(this.cancel)}>
                    Save single
                  </button>
                  <button onClick={() => editSubjectMulti.runMutation({ _ids: [this.state.editingId], name: this.el.value }).then(this.cancel)}>
                    Save multi
                  </button>
                  <button onClick={() => deleteSubject.runMutation({ _id: editingId }).then(this.cancel)}>DELETE</button>
                  <button onClick={this.cancel}>Cancel</button>
                </Fragment>
              ) : null}
            </div>
          )}
        </GraphQL>
      </div>
    );
  }
}
