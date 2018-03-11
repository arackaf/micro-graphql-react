# micro-graphql-react

A light (2.1K min+gzip) and simple solution for painlessly connecting your React components to a GraphQL endpoint.

Wrapped components maintain a basic client-side cache of your query history. The cache is LRU with a default size of 10, and stored at the level of the component, not the GraphQL type. As your instances mount and unmount, and update, the cache will be checked for existing results to matching queries, and will be used if found. This also means that two different components querying the same type, and returning the same fields will **not** be able to share caches. If that's a requirement, then check out Apollo, or Ken Wheeler's [urql](https://www.npmjs.com/package/urql). This project is intended to be small and simple, and, unlike other GraphQL libraries, allow you to cache at the Service Worker level, discussed below.

Queries are fetched via HTTP GET, so while the client-side caching is not nearly as robust as Apollo's, you can set up a Service Worker to cache results there; Google's Workbox, or sw-toolbox make this easy.

# Cache Invalidation

This library will not invalidate the client-side cache as you perform GraphQL mutations. The reason, quite simply, is because this is a hard problem, and no existing library handles it completely. Rather than try to solve this, you're left to just invalidate the cache as needed, likely by changing an identifier in your query. For more information, see [this explanation](./readme-cache.md)

# Usage

## Queries

```javascript
import { Client, query, compress, mutation, setDefaultClient } from "micro-graphql-react";

const client = new Client({
  endpoint: "/graphql",
  fetchOptions: { credentials: "include" }
});

setDefaultClient(client);

@query(props => ({
  query: compress`
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

The `query` decorator is passed a function mapping the component's props to an object with a `query` string, and an optional `variables` object. When the component first mounts, this query will be executed. When the component updates, the function will re-run with the new props, and the query will re-fetch **if** the newly-created GraphQL query is different.

Be sure to use the `compress` tag to remove un-needed whitespace from your query, since it will be sent via HTTP GET—just wrap any inline string parameters you may have in `${}` - for more information, see [here](./readme-compress.md).

### props passed to your component

* `loading` Fetch is executing for your query
* `loaded` Fetch has finished executing for your query
* `data` If the last fetch finished successfully, this will contain the data returned, else null
* `error` If the last fetch did not finish successfully, this will contain the errors that were returned, else null
* `reload` A function you can call to manually re-fetch the current query
* `clearCache` Clear the cache for this component
* `clearCacheAndReload` Calls `clearCache`, followed by `reload`

### Other options

The decorator can also take a second argument of options. The following properties can be passed in this object:

* `cacheSize` - override the default cache size of 10. Pass in 0 to disable caching completely
* `shouldQueryUpdate` - take control over whether your query re-runs, rather than having it re-run whenever the produced graphql query changes. This function is passed a single object with the properties listed below. If specified, your query will only automatically re-run when it returns true, though you can always manually re-load your query with the reload prop, discussed above.

  * prevProps - previous component props
  * props - current component props
  * prevQuery - previous graphql query string produced
  * query - current graphql query string produced
  * prevVariables - previous graphql variables produced
  * variables - current graphql variables produced

* `mapProps` - allows you to adjust the props passed to your component. If specified, a single object with all your component's props will be passed to this function, and the result will be spread into your component
* `client` - manually pass in a client to be used for this component

An example of `shouldQueryUpdate`, and `cacheSize`

```javascript
@query(
  props => ({
    query: compress`
    query ALL_BOOKS ($page: Int, $title: String, $version: Int) {
      allBooks(PAGE: $page, PAGE_SIZE: 3, title_contains: $title, version: $version) {
        Books {
          _id
          title
        }
      }
    }`,
    variables: {
      page: props.page,
      title: props.title,
      version: props.version
    }
  }),
  {
    cacheSize: 3,
    shouldQueryUpdate: ({ prevVariables, variables }) => prevVariables.version != variables.version
  }
)
class QueryWithOptions extends Component {
  render() {
    let { loading, loaded, data, reload, title, version } = this.props;
    return (
      <div>
        {loading ? <div>LOADING</div> : null}
        {loaded ? <div>LOADED</div> : null}
        <br />
        {data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
      </div>
    );
  }
}
```

An example of `mapProps`

```javascript
@query(
  props => ({
    query: compress`
    query ALL_BOOKS {
      allBooks(SORT: {title: 1}, PAGE_SIZE: 1, PAGE: 1) {
        Books {
          _id
          title
        }
      }
    }`
  }),
  { mapProps: props => ({ firstBookProps: props }) }
)
@query(
  props => ({
    query: compress`
    query ALL_BOOKS {
      allBooks(SORT: {title: -1}, PAGE_SIZE: 1, PAGE: 1)  {
        Books {
          _id
          title
        }
      }
    }`
  }),
  { mapProps: props => ({ lastBookProps: props }) }
)
class TwoQueries extends Component {
  render() {
    let { firstBookProps, lastBookProps } = this.props;
    return (
      <div>
        {firstBookProps.loading || lastBookProps.loading ? <div>LOADING</div> : null}
        {firstBookProps.loaded || lastBookProps.loaded ? <div>LOADED</div> : null}
        {firstBookProps.data ? <ul>{firstBookProps.data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
        {lastBookProps.data ? <ul>{lastBookProps.data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
      </div>
    );
  }
}
```

## Mutations

```javascript
@mutation(
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

Same idea, but just a string for your mutation. You'll get a `runMutation` function in your props that you can call, and pass your variables.

### props passed to your component

* `running` Mutation is executing
* `finished` Mutation has finished executing
* `runMutation` A function you can call when you want to run your mutation. Pass it an object with your variables

### Other options

Like `query`, you can pass a second argument to your `mutation` decorator. Here, this object only supports the `mapProps`, and `client` options, which work the same as for queries.

```javascript
@query(props => ({
  query: compress`
    query ALL_BOOKS {
      allBooks(PAGE: 1, PAGE_SIZE: 3) {
        Books { 
          _id 
          title
          pages
        }
      }
    }`
}))
@mutation(
  `mutation modifyBook($_id: String, $title: String) {
    updateBook(_id: $_id, Updates: { title: $title }) {
      success
    }
  }`,
  { mapProps: props => ({ titleMutation: props }) }
)
@mutation(
  `mutation modifyBook($_id: String, $pages: Int) {
    updateBook(_id: $_id, Updates: { pages: $pages }) {
      success
    }
  }`,
  { mapProps: props => ({ pagesMutation: props }) }
)
class TwoMutationsAndQuery extends Component {
  state = { editingId: "", editingOriginaltitle: "" };
  edit = book => {
    this.setState({ editingId: book._id, editingOriginaltitle: book.title, editingOriginalpages: book.pages });
  };
  render() {
    let { loading, loaded, data, titleMutation, pagesMutation } = this.props;

    let { editingId, editingOriginaltitle, editingOriginalpages } = this.state;
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
            {titleMutation.running ? <div>RUNNING</div> : null}
            {titleMutation.finished ? <div>SAVED</div> : null}
            <input defaultValue={editingOriginaltitle} ref={el => (this.el = el)} placeholder="New title here!" />
            <button onClick={() => titleMutation.runMutation({ _id: editingId, title: this.el.value })}>Save</button>

            {pagesMutation.running ? <div>RUNNING</div> : null}
            {pagesMutation.finished ? <div>SAVED</div> : null}
            <input defaultValue={editingOriginalpages} ref={el => (this.elPages = el)} placeholder="New pages here!" />
            <button onClick={() => pagesMutation.runMutation({ _id: editingId, pages: +this.elPages.value })}>Save</button>
          </Fragment>
        ) : null}
      </div>
    );
  }
}
```

## Can I put a Query and Mutation on the same component?

Of course.

```javascript
@query(props => ({
  query: compress`
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

## Adjusting the props passed to your components

Both query and mutation allow you to modify how the GraphQL props are passed to your component via the `mapProps` option. This is explained above.

## Manually running queries or mutations

It's entirely possible some pieces of data may need to be loaded from, and stored in your state manager, rather than fetched via a component's lifecycle; this is easily accomodated. The component decorators run their queries and mutations through the client object you're already setting via `setDefaultClient`. You can call those methods yourself, in your state manager (or anywhere).

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
const BasicQueryWrapped = query(props => ({
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

* Add a render prop API
