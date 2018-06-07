# micro-graphql-react

A light (2.1K min+gzip) and simple solution for painlessly connecting your React components to a GraphQL endpoint.

Wrapped components maintain a basic client-side cache of your query history. The cache is LRU with a default size of 10, and stored at the level of the component, not the GraphQL type. As your instances mount and unmount, and update, the cache will be checked for existing results to matching queries, and will be used if found. This also means that two different components querying the same type, and returning the same fields will **not** be able to share caches. If that's a requirement, then check out Apollo, or Ken Wheeler's [urql](https://www.npmjs.com/package/urql). This project is intended to be small and simple, and, unlike other GraphQL libraries, allow you to cache at the Service Worker level, discussed below.

Queries are fetched via HTTP GET, so while the client-side caching is not nearly as robust as Apollo's, you can set up a Service Worker to cache results there; Google's Workbox, or sw-toolbox make this easy.

**A note on cache invalidation**

This library will not automatically add metadata requests to your query, and attempt to automatically update your cached results. The reason, quite simply, is because this is a hard problem, and no existing library handles it completely. Rather than try to solve this, you're given some simple primitives which will allow you to specify how given mutations should affect cached results. It's slightly more work, but it allows you to tailer your solution to your app's precise needs, and, given the predictable, standard nature of GraphQL results, it's easily built on and abstracted. Of course you can just turn client-side caching off, and run a network request each time, which, if you have a Service Worker set up, may not be too bad at all. This is all explained at length, below

For more information on the difficulties of GraphQL caching, see [this explanation](./readme-cache.md)

<!-- TOC -->

- [Queries](#queries)
  - [props passed to your component](#props-passed-to-your-component)
  - [Other options](#other-options)
- [Mutations](#mutations)
  - [props passed to your component](#props-passed-to-your-component-1)
  - [Other options](#other-options-1)
- [Cache invalidation](#cache-invalidation)
  - [Use case 1: Update current results, but otherwise clear the cache](#use-case-1-update-current-results-but-otherwise-clear-the-cache)
- [Manually running queries or mutations](#manually-running-queries-or-mutations)
  - [Client api](#client-api)
- [Transpiling decorators](#transpiling-decorators)
  - [But I don't like decorators](#but-i-dont-like-decorators)
- [Use in old browsers](#use-in-old-browsers)
- [What's next](#whats-next)

<!-- /TOC -->

## Queries

```javascript
import { Client, query, compress, mutation, setDefaultClient } from "micro-graphql-react";

const client = new Client({
  endpoint: "/graphql",
  fetchOptions: { credentials: "include" }
});

setDefaultClient(client);

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
```

The `query` decorator is passed the GraphQL query, an optional function mapping the component's props to a variables object. When the component first mounts, this query will be executed. When the component updates, the variables function will re-run with the new props, and the query will re-fetch **if** the newly-created GraphQL query is different. Of course if your query has no variables, it'll never update.

Be sure to use the `compress` tag to remove un-needed whitespace from your query, since it will be sent via HTTP GET—just wrap any inline string parameters you may have in `${}` - for more information, see [here](./readme-compress.md).

### props passed to your component

- `loading` Fetch is executing for your query
- `loaded` Fetch has finished executing for your query
- `data` If the last fetch finished successfully, this will contain the data returned, else null
- `error` If the last fetch did not finish successfully, this will contain the errors that were returned, else null
- `reload` A function you can call to manually re-fetch the current query
- `clearCache` Clear the cache for this component
- `clearCacheAndReload` Calls `clearCache`, followed by `reload`

### Other options

The decorator can also take a third argument of options (or second argument, if your query doesn't use variables). The following properties can be passed in this object:

- `onMutation` - a map of mutations, along with handlers. This is how you update your cached results after mutations, and is explained more fully below
- `mapProps` - allows you to adjust the props passed to your component. If specified, a single object with all your component's props will be passed to this function, and the result will be spread into your component
- `cacheSize` - override the default cache size of 10. Pass in 0 to disable caching completely
- `shouldQueryUpdate` - take control over whether your query re-runs, rather than having it re-run whenever the produced graphql query changes. This function is passed a single object with the properties listed below. If specified, your query will only re-run when it returns true, though you can always manually re-load your query with the reload prop, discussed above.

  - prevProps - previous component props
  - props - current component props
  - prevVariables - previous graphql variables produced
  - variables - current graphql variables produced

- `client` - manually pass in a client to be used for this component

An example of `mapProps` and `cacheSize`

```javascript
@query(
  `
    query ALL_BOOKS($title_contains: String) {
      allBooks(title_contains: $title_contains, SORT: {title: 1}, PAGE_SIZE: 1, PAGE: 1) {
        Books {
          _id
          title
        }
      }
    }`,
  props => ({ title_contains: props.title_contains }),
  { mapProps: props => ({ firstBookProps: props }), cacheSize: 3 }
)
@query(
  `
  query ALL_BOOKS($title_contains: String) {
    allBooks(title_contains: $title_contains, SORT: {title: -1}, PAGE_SIZE: 1, PAGE: 1) {
      Books {
        _id
        title
      }
    }
  }`,
  props => ({ title_contains: props.title_contains }),
  { mapProps: props => ({ lastBookProps: props }), cacheSize: 3 }
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

Same idea as with query, just a string for your mutation and you'll get a `runMutation` function in your props that you can call, and pass your variables.

### props passed to your component

- `running` Mutation is executing
- `finished` Mutation has finished executing
- `runMutation` A function you can call when you want to run your mutation. Pass it an object with your variables

### Other options

Like `query`, you can pass a second argument to your `mutation` decorator. Here, this object only supports the `mapProps`, and `client` options, which work the same as for queries.

```javascript
@query(
  `
    query ALL_BOOKS($page: Int) {
      allBooks(PAGE: $page, PAGE_SIZE: 3) {
        Books {
          _id
          title
          pages
        }
      }
    }`,
  props => ({ page: props.page })
)
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

## Cache invalidation

The onMutation option that `query` takes is an object, or array of objects, of the form `{ when: "string|regularExpression", run: function }`

`when` is a string or regular expression that's tested against each result set of any mutations that finish. If the mutation has any matches, then `run` will be called with two arguments: the entire mutation result, and an object with these propertes: `{ softReset, currentResults, hardReset, cache, refresh }`

`softReset` - clears the cache, but does **not** re-issue any queries. It can optionally take an argument of new, updated results, which will update the `data` props passed
`currentResults` - the current results that are passed as your `data` prop
`hardReset` - clear the cache, and re-load the current query
`cache` - the actual cache object. You can enumerate its entries, and update whatever you need.
`refresh` - refresh the current query from cache. You'll likely want to call this after modifying the cache.

Many use cases follow. They'll all be based on an hypothetical book tracking website since, if we're honest, the Todo example has been stretched to its limit—and also I build a book tracking website and so already have some data to work with :D

### Use case 1: Update current results, but otherwise clear the cache

Let's say that, upon successful mutation, you want to update your current results based on what was changed, clear all other cache entries, including the existing one, but not run any network requests. So, if you have a book search for an author of Dumas Malone, but one of the results was written by Shelby Foote, and you click the edit button and fix it, you want that book to now show the updated values, but stay in the current results, since re-loading the current query and having the book just vanish is bad UX in your opinion. (if you do want to do that, stay tuned, it's even easier).

Let's look at some code. Our components will be using these constants

```javascript
export const BOOKS_QUERY = `
query ALL_BOOKS($page: Int) {
  allBooks(PAGE: $page, PAGE_SIZE: 3) {
    Books { _id title pages }
  }
}`;

export const BOOKS_MUTATION = `mutation modifyBook($_id: String, $title: String, $pages: Int) {
  updateBook(_id: $_id, Updates: { title: $title, pages: $pages }) {
    Book { _id title pages }
  }
}`;

export const SUBJECTS_QUERY = `
query ALL_SUBJECTS($page: Int) {
  allSubjects(PAGE: $page, PAGE_SIZE: 3) {
    Subjects { _id name }
  }
}`;

export const SUBJECTS_MUTATION = `mutation modifySubject($_id: String, $name: String) {
  updateSubject(_id: $_id, Updates: { name: $name }) {
    Subject { _id name }
  }
}`;
```

Let's see a (contrived) component to list books, and allow you to edit their title, and then update any changes, while clearing the cache, as described above

```javascript
@query(BOOKS_QUERY, props => ({ page: props.page }), {
  onMutation: {
    when: "updateBook",
    run: ({ updateBook: { Book } }, { softReset, currentResults }) => {
      let CachedBook = currentResults.allBooks.Books.find(b => b._id == Book._id);
      CachedBook && Object.assign(CachedBook, Book);
      softReset(currentResults);
    }
  }
})
@mutation(BOOKS_MUTATION)
export class SoftResetCacheInvalidationBooks extends Component {
  state = { editingId: "", editingOriginaltitle: "" };
  edit = book => this.setState({ editingId: book._id, editingOriginaltitle: book.title, editingOriginalpages: book.pages });
  cancel = () => this.setState({ editingId: null });

  render() {
    let { data, runMutation } = this.props;
    let { editingId, editingOriginaltitle, editingOriginalpages } = this.state;
    return (
      <div>
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
            <input defaultValue={editingOriginaltitle} style={{ width: "300px" }} ref={el => (this.el = el)} placeholder="New title here!" />
            <input defaultValue={editingOriginalpages} ref={el => (this.elPages = el)} placeholder="New pages here!" />
            <button onClick={() => runMutation({ _id: editingId, title: this.el.value, pages: +this.elPages.value }).then(this.cancel)}>Save</button>
            <button onClick={this.cancel}>Cancel</button>
          </Fragment>
        ) : null}
      </div>
    );
  }
}
```

The interesting work is being done on line 2 above, in `onMutation`. Whenever a mutation comes back with `updateBook` results, we use `softReset` to update our current results, while clearing all cache results. This will also clear the current cache result, so if you page up, then come back down to where you were, a **new** network request will be run, and so your edited book will no longer be there, as you want.

This seems like quite a lot of boilerplate, but lets look at another example and see if any patterns emerge. Specifically, lets look at a (again contrived) component that lists out our books' subjects, with the option of editing them, and updating as we did above.

```javascript
@query(SUBJECTS_QUERY, props => ({ page: props.page }), {
  onMutation: {
    when: "updateSubject",
    run: ({ updateSubject: { Subject } }, { softReset, currentResults }) => {
      let CachedSubject = currentResults.allSubjects.Subjects.find(s => s._id == Subject._id);
      CachedSubject && Object.assign(CachedSubject, Subject);
      softReset(currentResults);
    }
  }
})
@mutation(SUBJECTS_MUTATION)
export class SoftResetCacheInvalidationSubjects extends Component {
  state = { editingId: "", editingOriginalName: "" };
  edit = subject => this.setState({ editingId: subject._id, editingOriginalName: subject.name });
  cancel = () => this.setState({ editingId: null });

  render() {
    let { data, runMutation } = this.props;
    let { editingId, editingOriginalName, editingOriginalpages } = this.state;
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

        {editingId ? (
          <Fragment>
            <input defaultValue={editingOriginalName} style={{ width: "300px" }} ref={el => (this.el = el)} placeholder="New name here!" />
            <button onClick={() => runMutation({ _id: editingId, name: this.el.value }).then(this.cancel)}>Save</button>
            <button onClick={this.cancel}>Cancel</button>
          </Fragment>
        ) : null}
      </div>
    );
  }
}
```

Assuming we've named our GraphQL operations consistently, and we should have, then theres some pretty obvious repetition happening. We can easily refactor this repetition into some helper methods that can be re-used throughout our app. Let's see what that looks like

```javascript
const standardUpdateSingleStrategy = name => ({
  when: `update${name}`,
  run: ({ [`update${name}`]: { [name]: updatedItem } }, { softReset, currentResults }) => {
    let CachedItem = currentResults[`all${name}s`][`${name}s`].find(x => x._id == updatedItem._id);
    CachedItem && Object.assign(CachedItem, updatedItem);
    softReset(currentResults);
  }
});
```

Now we can clean up all that boilerplate from before

```javascript
@query(BOOKS_QUERY, props => ({ page: props.page }), { onMutation: standardUpdateSingleStrategy("Book") })
@mutation(BOOKS_MUTATION)
export class SoftResetCacheInvalidationBooks extends Component {
  //same as before
}

@query(SUBJECTS_QUERY, props => ({ page: props.page }), { onMutation: standardUpdateSingleStrategy("Subject") })
@mutation(SUBJECTS_MUTATION)
export class SoftResetCacheInvalidationSubjects extends Component {
  //same as before
}
```

And of course, if you have multiple mutations, just pass them all in an array

## Manually running queries or mutations

It's entirely possible some pieces of data may need to be loaded from, and stored in your state manager, rather than fetched via a component's lifecycle; this is easily accomodated. The component decorators run their queries and mutations through the client object you're already setting via `setDefaultClient`. You can call those methods yourself, in your state manager (or anywhere).

### Client api

- `runQuery(query: String, variables?: Object)`
- `runMutation(mutation: String, variables?: Object)`

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

## Transpiling decorators

Be sure to use the `babel-plugin-transform-decorators-legacy` Babel preset. The code is not _yet_ updated to work with the new decorators proposal.

### But I don't like decorators

That's fine! This will work too

```javascript
class BasicQueryNoDecorators extends Component {
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
const BasicQueryConnected = query(
  `
    query ALL_BOOKS($page: Int) {
      allBooks(PAGE: $page, PAGE_SIZE: 3) {
        Books {
          _id
          title
        }
      }
    }`,
  props => ({ page: props.page })
)(BasicQueryNoDecorators);
```

I plan on supporting both the old, and new class decorator formats indefinitely, if for no other reason than to transparently allow for separate, explicit wrapping like the above. This pattern is popular for unit testing React components.

But really, don't be afraid to give decorators a try: they're awesome!

## Use in old browsers

By default this library ships standard ES6, which should work in all modern browsers. If you have to support older, non-ES6 browsers like IE, then just add the following alias to your webpack's resolve section

```javascript
  resolve: {
    alias: {
      "micro-graphql-react": "node_modules/micro-graphql-react/index-es5.js"
    },
    modules: [path.resolve("./"), path.resolve("./node_modules")]
  }
```

## What's next

- Add a render prop API
