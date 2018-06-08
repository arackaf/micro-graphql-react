import React, { Component, Fragment } from "react";
import { render } from "react-dom";
import { Client, query, mutation, setDefaultClient } from "../index-local";

import BasicQuery from "./basicQuery";
import TwoQueries from "./twoQueries";
import TwoMutationsAndQuery from "./twoMutationsAndQuery";

import BookGruntWork from "./bookGruntWork";
import SubjectGruntWork from "./subjectGruntWork";
//import { BookQueryComponent, SubjectQueryComponent } from "./cacheInvalidation1";
//import { BookQueryComponent, SubjectQueryComponent } from "./cacheInvalidation2";
import { BookQueryComponent, SubjectQueryComponent } from "./cacheInvalidationB";
import BasicQueryNoDecorators from "./basicQueryNoDecorators";

const client = new Client({
  endpoint: "/graphql",
  fetchOptions: { credentials: "include" }
});

const client2 = new Client({
  endpoint: "/graphql2",
  fetchOptions: { credentials: "include" }
});

setDefaultClient(client2);

// class ManualMutation extends Component {
//   loadManual = () => {
//     client.runQuery(
//       `query ALL_BOOKS ($page: Int) {
//         allBooks(PAGE: $page, PAGE_SIZE: 3) {
//           Books {
//             _id
//             title
//           }
//         }
//       }`,
//       { title: 1 }
//     );
//   };
//   save = () => {
//     client.runMutation(
//       `mutation modifyBook($title: String) {
//         updateBook(_id: "591a83af2361e40c542f12ab", Updates: { title: $title }) {
//           Book {
//             _id
//             title
//           }
//         }
//       }`,
//       { title: this.el.value }
//     );
//   };
//   render() {
//     let { running, finished, runMutation } = this.props;
//     return (
//       <div>
//         <button onClick={this.loadManual}>LOAD</button>
//         <input ref={el => (this.el = el)} placeholder="New manual title here!" />
//         <button onClick={this.save}>Save</button>
//       </div>
//     );
//   }
// }

// @mutation(
//   client,
//   `mutation modifyBook($title: String) {
//     updateBook(_id: "591a83af2361e40c542f12ab", Updates: { title: $title }) {
//       Book {
//         _id
//         title
//       }
//     }
//   }`
// )
// class BasicMutation extends Component {
//   render() {
//     let { running, finished, runMutation } = this.props;
//     return (
//       <div>
//         {running ? <div>RUNNING</div> : null}
//         {finished ? <div>SAVED</div> : null}

//         <input ref={el => (this.el = el)} placeholder="New title here!" />
//         <button onClick={() => runMutation({ title: this.el.value })}>Save</button>
//       </div>
//     );
//   }
// }

// @query(client, props => ({
//   query: `
//     query ALL_BOOKS {
//       ${props.page % 2 ? "allBooks" : "allBooksX"}(PAGE: ${props.page}, PAGE_SIZE: 3) {
//         Books {
//           _id
//           title
//         }
//       }
//     }`
// }))
// class BasicQueryWithError extends Component {
//   render() {
//     let { loading, loaded, data, error } = this.props;
//     return (
//       <div>
//         {loading ? <div>LOADING</div> : null}
//         {loaded ? <div>LOADED</div> : null}
//         {data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
//         {error ? (
//           <div>
//             {error
//               .map(e => e.message)
//               .join(",")
//               .toString()}
//           </div>
//         ) : null}
//       </div>
//     );
//   }
// }

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

        {/*<TwoQueries title_contains="Sec" />
        <br />
        <br />
        */}
        {/*
        <BasicQueryNoDecorators page={2} />
        <TwoMutationsAndQuery page={1} />
        */}
        <BookQueryComponent page={this.state.page} />
        <BookGruntWork page={this.state.page} />

        <SubjectQueryComponent page={this.state.page} />
        <SubjectGruntWork page={this.state.page} />
        {/*<BasicQuery page={this.state.page} />*/}

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
