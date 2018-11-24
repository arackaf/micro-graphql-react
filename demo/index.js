import React, { Component, Fragment } from "react";
import { render } from "react-dom";
import { Client, setDefaultClient } from "../index-local";
import { BookQueryComponent1 as BookQueryComponent, BookEditing } from "./newComponents/useCase1";

//import BasicQuery from "./basicQuery";
//import TwoQueries from "./twoQueries";
//import TwoMutationsAndQuery from "./twoMutationsAndQuery";

//import BookGruntWork from "./bookGruntWork";
//import SubjectGruntWork from "./subjectGruntWork";
//import { BookQueryComponent, SubjectQueryComponent } from "./cacheInvalidation1";
//import { BookQueryComponent, SubjectQueryComponent } from "./cacheInvalidation2";
// import { BookQueryComponent, SubjectQueryComponent } from "./cacheInvalidationC";
//import BasicQueryNoDecorators from "./basicQueryNoDecorators";

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
        {/* <BasicQuery page={this.state.page} /> */}
        <br />
        <hr />
        {/*<TwoQueries title_contains="Sec" />
        <br />
        <br />
        */}
        {/*
        <BasicQueryNoDecorators page={2} />
        <TwoMutationsAndQuery page={1} />
        */}
        {/* <BookQueryComponent page={this.state.page} /> */}
        {/* <BookGruntWork page={this.state.page} /> */}

        {/*
        <SubjectQueryComponent page={this.state.page} />
        <SubjectGruntWork page={this.state.page} />
        */}

        {/*
        <br />
        <br />
        <br />
        <br />
        
        
        <BasicMutation />

        <br />
        <br />

        */}

        <br />
        <br />
        {/*<ManualMutation />
        <br />
        <br />

        <br />
        <br />
        <MutationAndQuery />
        <br />
        <br />
        {this.state.shown ? <BasicQuery page={this.state.page} /> : null}
        {this.state.shown ? <BasicQueryWithVariables page={this.state.page} /> : null}
        {this.state.shown ? <BasicQueryWithError page={this.state.page} /> : null}
        {this.state.shown ? <BasicQueryWrapped page={this.state.page} /> : null}
        <hr />
        */}

        {/*
        {this.state.shown ? <BasicQueryConflict page={this.state.pageConflict1} /> : null}
        {this.state.shown ? <BasicQueryConflict page={this.state.pageConflict2} /> : null}
        */}
      </div>
    );
  }
}

render(<TestingSandbox1 />, document.getElementById("home1"));
