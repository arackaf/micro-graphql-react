# micro-graphql-react

A light (about 6K min+gzip) and simple solution for painlessly connecting your React components into a GraphQL endpoint.

Wrapped components will _not_ maintain a client-side cache of your query history, but _will_ remember the last run query's results, so they can be restored if your component unmounts and remounts, without needing to run a new network request. This assumes you only render the component in one place. If you render the multiple instances of your component, then each subseuqent instance will keep track of its own current query; this means they will always fire a network request on mount, even if their query values happen to match the original instance's current query values. The end result will be correct, though not ideal. Some future optimization may be possible here, but if more intelligent and robust caching is a requirement for you, then by all means use Apollo, or Ken Wheeler's [urql](https://www.npmjs.com/package/urql). Then again, read on to hear about a potentially simpler, more powerful form of querying that's not usually available with GraphQL libraries.

Queries are fetched via HTTP GET, so while no client-side cache of prior queries is maintained, you can easily set up a Service Worker to cache your queries using something like Google's Workbox, or sw-toolbox.

# Usage

## Queries

```javascript
import { Client, query } from "micro-graphql-react";

const client = new Client({
  endpoint: "/graphql",
  fetchOptions: { credentials: "include" }
});

@query(client, props => ({
  query: `
    query ALL_BOOKS ($page: Int) {
      allBooks(PAGE: $page, PAGE_SIZE: 3) {
        Books {
          _id
          title
        }
      }
    }`,
  variables: {
    page: props.page
  }
}))
class BasicQueryWithVariables extends Component {
  render() {
    let { loading, loaded, data, error } = this.props;
    return (
      <div>
        {loading ? <div>LOADING</div> : null}
        {loaded ? <div>LOADED</div> : null}
        {data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
        {error ? (
          <div>
            {error
              .map(e => e.message)
              .join(",")
              .toString()}
          </div>
        ) : null}
      </div>
    );
  }
}
```

The `query` decorator is passed a `client` instance, and a function mapping the component's props to an object with a `query` string, and an optional `variables` object. When the component mounts, this query will be executed. When the component updates, the function will re-run with the new props, and the query will re-run **if** a new `query` value, or a variables object with different values are returned.

### props passed to your component

`loading` fetch is executing for your query
`loading` fetch has finished executing for your query
`data` if the last fetch finished successfully, this will contain the data returned
`error` if the last fetch did not finish successfully, this will contain the errors that were returned
`reload` a function you can call to manually re-run the current query

## Mutations

```javascript
@mutation(
  client,
  `mutation modifyBook($title: String) {
    updateBook(_id: "591a83af2361e40c542f12ab", Updates: { title: $title }) {
      Book {
        _id
        title
      }
    }
  }`
)
class BasicMutation extends Component {
  render() {
    let { running, finished, runMutation } = this.props;
    return (
      <div>
        {running ? <div>RUNNING</div> : null}
        {finished ? <div>SAVED</div> : null}

        <input ref={el => (this.el = el)} placeholder="New title here!" />
        <button onClick={() => runMutation({ title: this.el.value })}>Save</button>
      </div>
    );
  }
}
```

Same idea, pass a client instance, and then just a string for your mutation, with whatever variables you need. You'll get a `runMutation` function that you can call, and pass in your variables.

### props passed to your component

`running` mutation is executing
`finished` mutation has finished executing
`runMutation` a function you can call when you want to run your mutation. Pass it an object with whatever variables you want passed down

## Can I put a Query and Mutation on the same component?

Of course.

```javascript
@query(client, props => ({
  query: `
    query ALL_BOOKS {
      allBooks(PAGE: 1, PAGE_SIZE: 3) {
        Books { 
          _id 
          title 
        }
      }
    }`
}))
@mutation(
  client,
  `mutation modifyBook($_id: String, $title: String) {
    updateBook(_id: $_id, Updates: { title: $title }) {
      success
    }
  }`
)
class MutationAndQuery extends Component {
  state = { editingId: "", editingOriginaltitle: "" };
  edit = book => {
    this.setState({ editingId: book._id, editingOriginaltitle: book.title });
  };
  render() {
    let { loading, loaded, data, running, finished, runMutation } = this.props;
    let { editingId, editingOriginaltitle } = this.state;
    return (
      <div>
        {loading ? <div>LOADING</div> : null}
        {loaded ? <div>LOADED</div> : null}
        {data ? (
          <ul>
            {data.allBooks.Books.map(book => (
              <li key={book._id}>
                {book.title}
                <button onClick={() => this.edit(book)}> edit</button>
              </li>
            ))}
          </ul>
        ) : null}

        {editingId ? (
          <Fragment>
            {running ? <div>RUNNING</div> : null}
            {finished ? <div>SAVED</div> : null}
            <input defaultValue={editingOriginaltitle} ref={el => (this.el = el)} placeholder="New title here!" />
            <button onClick={() => runMutation({ _id: editingId, title: this.el.value })}>Save</button>
          </Fragment>
        ) : null}
      </div>
    );
  }
}
```

## Manually running queries or mutations

It's entirely possible that some pieces of data may need to be shared in multiple components, or stored in your state manager for any number of reasons. This is easily accomodated. The component decorators run their queries and mutations through the client object you're passing in. You can call those methods yourself, in your state manager as needed.

### Client api

`runQuery(query: String, variables?: Object)`

`runMutation(mutation: String, variables?: Object)`

For example, to imperatively run the query from above in application code, you can do

```javascript
client.runQuery(
  `query ALL_BOOKS ($page: Int) {
    allBooks(PAGE: $page, PAGE_SIZE: 3) {
      Books { 
        _id 
        title 
      }
    }
  }`,
  { title: 1 }
);
```

and to run the mutation from above, you can do

```javascript
client.runMutation(
  `mutation modifyBook($title: String) {
    updateBook(_id: "591a83af2361e40c542f12ab", Updates: { title: $title }) {
      Book {
        _id
        title
      }
    }
  }`,
  { title: "New title" }
);
```

## Transpiling decoratrs

Be sure to use the `babel-plugin-transform-decorators-legacy` Babel preset. The code is not _yet_ updated to work with the new decorators proposal.

### But I don't like decorators

That's fine! This will work too

```javascript
class BasicQueryUnwrapped extends Component {
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
const BasicQueryWrapped = query(client, props => ({
  query: `
    query ALL_BOOKS {
      allBooks(PAGE: ${props.page}, PAGE_SIZE: 3) {
        Books {
          _id
          title
        }
      }
    }`
}))(BasicQueryUnwrapped);
```

Just note that when the new decorators proposal comes around, and this project is updated to use it, the same api will no longer work interchangeably. When that happens, the existing `query` method will be updated to work as a decorator under the new proposal, and a new export will be created to work as a manual function wrapper. So if you avoid using decorators, expect a breaking change at some point. But really, give decorators a try: they're awesome!

## What's next

* Expose a re-fetch method so users can manually reload the current query, if needed
* Mutations
* Allow HoC to specify custom mapping of the props, to avoid clashes.
* Add a render prop API
