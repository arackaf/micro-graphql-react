import React, { Component, Fragment } from "react";
import { query, mutation } from "../index-local";
import { SUBJECTS_QUERY, SUBJECTS_MUTATION, SUBJECTS_MUTATION_MULTI, SUBJECT_CREATE, SUBJECT_DELETE } from "./savedQueries";

@query(SUBJECTS_QUERY, props => ({ page: props.page }))
@mutation(SUBJECTS_MUTATION, { mapProps: props => ({ singleMutation: props }) })
@mutation(SUBJECTS_MUTATION_MULTI, { mapProps: props => ({ multiMutation: props }) })
@mutation(SUBJECT_CREATE, { mapProps: props => ({ subjectCreation: props }) })
@mutation(SUBJECT_DELETE, { mapProps: props => ({ subjectDeletion: props }) })
export default class SubjectGruntWork extends Component {
  state = { editingId: "", editingOriginalName: "" };
  edit = subject => this.setState({ editingId: subject._id, editingOriginalName: subject.name });
  cancel = () => this.setState({ editingId: null });

  saveSingle = () => {
    this.props.singleMutation.runMutation({ _id: this.state.editingId, name: this.el.value }).then(this.cancel);
  };
  saveMulti = () => {
    this.props.multiMutation.runMutation({ _ids: [this.state.editingId], name: this.el.value }).then(this.cancel);
  };

  runCreate = () => {
    this.props.subjectCreation.runMutation({ Subject: { name: this.newSubjectNameEl.value } }).then(this.cancel);
  };

  render() {
    let { data, singleMutation, multiMutation, subjectDeletion } = this.props;
    let { editingId, editingOriginalName } = this.state;
    return (
      <div>
        {data ? (
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
        <button onClick={this.runCreate}>CREATE</button>
        <br />
        {editingId ? (
          <Fragment>
            <input defaultValue={editingOriginalName} style={{ width: "300px" }} ref={el => (this.el = el)} placeholder="New title here!" />
            <button onClick={this.saveSingle}>Save single</button>
            <button onClick={this.saveMulti}>Save multi</button>
            <button onClick={() => subjectDeletion.runMutation({ _id: editingId }).then(this.cancel)}>DELETE</button>
            <button onClick={this.cancel}>Cancel</button>
          </Fragment>
        ) : null}
      </div>
    );
  }
}
