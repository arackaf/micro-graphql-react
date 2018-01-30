# micro-graphql-react

A light (about 10K min+gzip) and simple solution for painlessly connecting your React components to a GraphQL endpoint. Note that this project includes `graphql-request`, so if you're already using that, the net cost is only 6.5K

Wrapped components maintain a basic client-side cache of your query history. The cache is LRU with a default size of 10, and stored at the level of the component, not the GraphQL type. As your instances mount and unmount, and update, the cache will be checked for existing results to matching queries, and will be used if found. This also means that two different components querying the same type, and returning the same fields will **not** be able to share caches. If that's a requirement, then check out Apollo, or Ken Wheeler's [urql](https://www.npmjs.com/package/urql). This project is intended to be small and simple, and, unlike other GraphQL libraries, allow you to cache at the Service Worker level, discussed below.

Queries are fetched via HTTP GET, so while no client-side cache of prior queries is maintained, you can set up a Service Worker to cache them; Google's Workbox, or sw-toolbox make this easy.

# Usage

## Queries

```javascript
import { Client, query, mutation } from "micro-graphql-react";

const client = new Client({
  endpoint: "/graphql",
  fetchOptions: { credentials: "include" },
  cacheSize: 3 // defaults to 10 if left off. Pass 0 to disable caching
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

The `query` decorator is passed a `client` instance, and a function mapping the component's props to an object with a `query` string, and an optional `variables` object. When the component first mounts, this query will be executed. When the component updates, the function will re-run with the new props, and the query will re-fetch **if** a new `query` value, or differing variables are returned.

### props passed to your component

* `loading` Fetch is executing for your query
* `loading` Fetch has finished executing for your query
* `data` If the last fetch finished successfully, this will contain the data returned, else null
* `error` If the last fetch did not finish successfully, this will contain the errors that were returned, else null
* `reload` A function you can call to manually re-fetch the current query
* `clearCache` Clear the cache for this component
* `clearCacheAndReload` Calls `clearCache`, followed by `reload`

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

Same idea, pass a client instance, and then just a string for your mutation. You'll get a `runMutation` function in your props that you can call, and pass your variables.

### props passed to your component

* `running` Mutation is executing
* `finished` Mutation has finished executing
* `runMutation` A function you can call when you want to run your mutation. Pass it an object with your variables

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

It's entirely possible some pieces of data may need to be loaded from, and stored in your state manager, rather than fetched via a component's lifecycle; this is easily accomodated. The component decorators run their queries and mutations through the client object you're already passing in. You can call those methods yourself, in your state manager (or anywhere).

### Client api

* `runQuery(query: String, variables?: Object)`
* `runMutation(mutation: String, variables?: Object)`

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

* Allow HoC to specify custom mapping of the props, to avoid clashes.
* Create some basic query caching (but without any material increase in this library's size)
* Add a render prop API
