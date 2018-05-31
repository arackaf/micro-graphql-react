import React, { Component, Fragment } from "react";
import { render } from "react-dom";
import { Client, query, mutation, setDefaultClient } from "../index-local";

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
//       allBooks(PAGE: 1, PAGE_SIZE: 3) {
//         Books {
//           _id
//           title
//           pages
//         }
//       }
//     }`
// }))
// @mutation(
//   client,
//   `mutation modifyBook($_id: String, $title: String) {
//     updateBook(_id: $_id, Updates: { title: $title }) {
//       success
//     }
//   }`,
//   { mapProps: props => ({ titleMutation: props }) }
// )
// @mutation(
//   client,
//   `mutation modifyBook($_id: String, $pages: Int) {
//     updateBook(_id: $_id, Updates: { pages: $pages }) {
//       success
//     }
//   }`,
//   { mapProps: props => ({ pagesMutation: props }) }
// )
// class TwoMutationsAndQuery extends Component {
//   state = { editingId: "", editingOriginaltitle: "" };
//   edit = book => {
//     this.setState({ editingId: book._id, editingOriginaltitle: book.title, editingOriginalpages: book.pages });
//   };
//   render() {
//     let { loading, loaded, data, titleMutation, pagesMutation } = this.props;

//     let { editingId, editingOriginaltitle, editingOriginalpages } = this.state;
//     return (
//       <div>
//         {loading ? <div>LOADING</div> : null}
//         {loaded ? <div>LOADED</div> : null}
//         {data ? (
//           <ul>
//             {data.allBooks.Books.map(book => (
//               <li key={book._id}>
//                 {book.title}
//                 <button onClick={() => this.edit(book)}> edit</button>
//               </li>
//             ))}
//           </ul>
//         ) : null}

//         {editingId ? (
//           <Fragment>
//             {titleMutation.running ? <div>RUNNING</div> : null}
//             {titleMutation.finished ? <div>SAVED</div> : null}
//             <input defaultValue={editingOriginaltitle} ref={el => (this.el = el)} placeholder="New title here!" />
//             <button onClick={() => titleMutation.runMutation({ _id: editingId, title: this.el.value })}>Save</button>

//             {pagesMutation.running ? <div>RUNNING</div> : null}
//             {pagesMutation.finished ? <div>SAVED</div> : null}
//             <input defaultValue={editingOriginalpages} ref={el => (this.elPages = el)} placeholder="New pages here!" />
//             <button onClick={() => pagesMutation.runMutation({ _id: editingId, pages: +this.elPages.value })}>Save</button>
//           </Fragment>
//         ) : null}
//       </div>
//     );
//   }
// }

// @query(client, props => ({
//   query: `
//     query ALL_BOOKS {
//       allBooks(PAGE: 1, PAGE_SIZE: 3) {
//         Books {
//           _id
//           title
//         }
//       }
//     }`
// }))
// @mutation(
//   client,
//   `mutation modifyBook($_id: String, $title: String) {
//     updateBook(_id: $_id, Updates: { title: $title }) {
//       success
//     }
//   }`
// )
// class MutationAndQuery extends Component {
//   state = { editingId: "", editingOriginaltitle: "" };
//   edit = book => {
//     this.setState({ editingId: book._id, editingOriginaltitle: book.title });
//   };
//   render() {
//     let { loading, loaded, data, running, finished, runMutation } = this.props;
//     let { editingId, editingOriginaltitle } = this.state;
//     return (
//       <div>
//         {loading ? <div>LOADING</div> : null}
//         {loaded ? <div>LOADED</div> : null}
//         {data ? (
//           <ul>
//             {data.allBooks.Books.map(book => (
//               <li key={book._id}>
//                 {book.title}
//                 <button onClick={() => this.edit(book)}> edit</button>
//               </li>
//             ))}
//           </ul>
//         ) : null}

//         {editingId ? (
//           <Fragment>
//             {running ? <div>RUNNING</div> : null}
//             {finished ? <div>SAVED</div> : null}
//             <input defaultValue={editingOriginaltitle} ref={el => (this.el = el)} placeholder="New title here!" />
//             <button onClick={() => runMutation({ _id: editingId, title: this.el.value })}>Save</button>
//           </Fragment>
//         ) : null}
//       </div>
//     );
//   }
// }

@query(
  `
  query ALL_BOOKS ($page: Int) {
    allBooks(PAGE: $page, PAGE_SIZE: 3) {
      Books {
        _id
        title
      }
    }
  }`,
  props => ({ page: props.page })
)
class BasicQuery extends Component {
  render() {
    let { loading, loaded, data } = this.props;
    return (
      <div>
        {loading ? <div>LOADING</div> : null}
        {loaded ? <div>LOADED</div> : null}
        {data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
      </div>
    );
  }
}

// @query(client, props => ({
//   query: `
//     query ALL_BOOKS ($page: Int) {
//       allBooks(PAGE: $page, PAGE_SIZE: 3) {
//         Books {
//           _id
//           title
//         }
//       }
//     }`,
//   variables: {
//     page: props.page
//   }
// }))
// class BasicQueryWithVariables extends Component {
//   render() {
//     let { loading, loaded, data, reload } = this.props;
//     return (
//       <div>
//         <button onClick={reload}>Reload</button>
//         {loading ? <div>LOADING</div> : null}
//         {loaded ? <div>LOADED</div> : null}
//         {data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
//       </div>
//     );
//   }
// }

// @query(
//   client,
//   props => ({
//     query: `
//     query ALL_BOOKS ($page: Int, $title: String, $version: Int) {
//       allBooks(PAGE: $page, PAGE_SIZE: 3, title_contains: $title, version: $version) {
//         Books {
//           _id
//           title
//         }
//       }
//     }`,
//     variables: {
//       page: props.page,
//       title: props.title,
//       version: props.version
//     }
//   }),
//   {
//     cacheSize: 3,
//     shouldQueryUpdate: ({ prevVariables, variables }) => prevVariables.version != variables.version
//   }
// )
// class QueryWithOptions extends Component {
//   render() {
//     let { loading, loaded, data, reload, title, version } = this.props;
//     return (
//       <div>
//         {loading ? <div>LOADING</div> : null}
//         {loaded ? <div>LOADED</div> : null}
//         <button onClick={reload}>reload</button>
//         <br />
//         {data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
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

// class BasicQueryUnwrapped extends Component {
//   render() {
//     let { loading, loaded, data } = this.props;
//     return (
//       <div>
//         {loading ? <div>LOADING</div> : null}
//         {loaded ? <div>LOADED</div> : null}
//         {data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
//       </div>
//     );
//   }
// }
// const BasicQueryWrapped = query(client, props => ({
//   query: `
//     query ALL_BOOKS {
//       allBooks(PAGE: ${props.page}, PAGE_SIZE: 3) {
//         Books {
//           _id
//           title
//         }
//       }
//     }`
// }))(BasicQueryUnwrapped);

// @query(client, props => ({
//   query: `
//     query ALL_BOOKS {
//       allBooks(PAGE: ${props.page}, PAGE_SIZE: 3) {
//         Books {
//           _id
//           title
//         }
//       }
//     }`
// }))
// class BasicQueryConflict extends Component {
//   render() {
//     let { loading, loaded, data, page, clearCache } = this.props;
//     return (
//       <div>
//         {loading ? <div>LOADING</div> : null}
//         {loaded ? (
//           <div>
//             LOADED {page} <button onClick={clearCache}>Clear cache</button>{" "}
//           </div>
//         ) : null}
//         {data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
//       </div>
//     );
//   }
// }

// @query(
//   client,
//   props => ({
//     query: `
//     query ALL_BOOKS {
//       allBooks(SORT: {title: 1}, PAGE_SIZE: 1, PAGE: 1) {
//         Books {
//           _id
//           title
//         }
//       }
//     }`
//   }),
//   { mapProps: props => ({ firstBookProps: props }) }
// )
// @query(
//   client,
//   props => ({
//     query: `
//     query ALL_BOOKS {
//       allBooks(SORT: {title: -1}, PAGE_SIZE: 1, PAGE: 1) {
//         Books {
//           _id
//           title
//         }
//       }
//     }`
//   }),
//   { mapProps: props => ({ lastBookProps: props }) }
// )
// class TwoQueries extends Component {
//   render() {
//     let { firstBookProps, lastBookProps } = this.props;
//     return (
//       <div>
//         {firstBookProps.loading || lastBookProps.loading ? <div>LOADING</div> : null}
//         {firstBookProps.loaded || lastBookProps.loaded ? <div>LOADED</div> : null}
//         {firstBookProps.data ? <ul>{firstBookProps.data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
//         {lastBookProps.data ? <ul>{lastBookProps.data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
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

        <BasicQuery page={this.state.page} />

        {/*
        <br />
        <br />
        <TwoMutationsAndQuery />
        <br />
        <br />
        
        
        <BasicMutation />
        <TwoQueries />

        {this.state.shown ? <QueryWithOptions {...{ title, version, page }} /> : null}
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
