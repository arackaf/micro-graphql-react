import React, { Component, Fragment } from "react";
import { render } from "react-dom";
import { Client, setDefaultClient } from "../index-local";
import { BookQueryComponent2 as BookQueryComponent, BookEditing } from "./newComponents/useCase1Books";
import { SubjectQueryComponent2 as SubjectQueryComponent, SubjectEditWork } from "./newComponents/useCase1Subjects";

const client = new Client({
  endpoint: "/graphql",
  fetchOptions: { credentials: "include" }
});

const client2 = new Client({
  endpoint: "/graphql2",
  fetchOptions: { credentials: "include" }
});

setDefaultClient(client2);

class TestingSandbox1 extends Component {
  state = { page: 1, shown: true, pageConflict1: 1, pageConflict2: 1, version: 0, title: "" };
  render() {
    let { title, version, page } = this.state;
    return (
      <div>
        <button onClick={() => this.setState({ page: this.state.page - 1 })}>Prev</button>
        <button onClick={() => this.setState({ page: this.state.page + 1 })}>Next</button>
        <button onClick={() => this.setState({ shown: !this.state.shown })}>toggle</button>
        <button onClick={() => this.setState({ pageConflict1: this.state.pageConflict1 - 1 })}>Prev Conf 1</button>
        <button onClick={() => this.setState({ pageConflict1: this.state.pageConflict1 + 1 })}>Next Conf 1</button>
        <button onClick={() => this.setState({ pageConflict2: this.state.pageConflict2 - 1 })}>Prev Conf 2</button>
        <button onClick={() => this.setState({ pageConflict2: this.state.pageConflict2 + 1 })}>Next Conf 2</button>
        <button onClick={() => this.setState({ version: this.state.version + 1 })}>Version</button>
        {this.state.version}
        <input value={this.state.title} onChange={e => this.setState({ title: e.target.value })} />

        <BookQueryComponent page={this.state.page} />
        <br />
        <br />
        <br />
        <BookEditing page={this.state.page} />

        <br />
        <hr />

        <SubjectQueryComponent page={this.state.page} />
        <br />
        <br />
        <br />
        <SubjectEditWork page={this.state.page} />
      </div>
    );
  }
}

render(<TestingSandbox1 />, document.getElementById("home1"));
