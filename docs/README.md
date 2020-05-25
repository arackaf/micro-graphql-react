<div class="flow-paragraph-items">

[![npm version](https://img.shields.io/npm/v/micro-graphql-react.svg?style=flat)](https://www.npmjs.com/package/micro-graphql-react) [![Build Status](https://travis-ci.com/arackaf/micro-graphql-react.svg?branch=master)](https://travis-ci.com/arackaf/micro-graphql-react) [![codecov](https://codecov.io/gh/arackaf/micro-graphql-react/branch/master/graph/badge.svg)](https://codecov.io/gh/arackaf/micro-graphql-react) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

</div>

# micro-graphql-react

A light (2.8K min+gzip) and simple solution for painlessly connecting your React components to a GraphQL endpoint.

Queries are fetched via HTTP GET, so while the client-side caching is in some ways not as robust as Apollo's, you can set up a Service Worker to cache results there; Google's Workbox, or sw-toolbox make this easy.

**Live Demo**

To see a live demo of this library managing GraphQL requests, check out this [Code Sandbox](https://codesandbox.io/s/l2z74x2687)

**A note on cache invalidation**

This library will _not_ add metadata to your queries, and attempt to automatically update your cached entries from mutation results. The reason, quite simply, is because this is a hard problem, and no existing library handles it completely. Rather than try to solve this, you're given some simple primitives which allow you to specify how given mutations should affect cached results. It's slightly more work, but it allows you to tailor your solution to your app's precise needs, and, given the predictable, standard nature of GraphQL results, composes well. This is all explained at length below.

For more information on the difficulties of GraphQL caching, see [this explanation](./docs/readme-cache.md)


## Installation

```javascript
npm i micro-graphql-react --save
```

**Note** - this project ships standard, modern JavaScript (ES6, object spread, etc) that works in all evergreen browsers. If you need to support ES5 environments like IE11, just add an alias pointing to the ES5 build in your webpack config like so

```javascript
alias: {
  "micro-graphql-react": "node_modules/micro-graphql-react/index-es5.js"
},
```

(`alias` goes under the `resolve` section in webpack.config.js)

## Creating a client

Before you do anything, you'll need to create a client.

```javascript
import { Client, setDefaultClient } from "micro-graphql-react";

const client = new Client({
  endpoint: "/graphql",
  fetchOptions: { credentials: "include" }
});

setDefaultClient(client);
```

Now that client will be used by default, everywhere, unless you manually pass in a different client to a hook's options, as discussed below.

### Accessing the client

To access the default client anywhere in your codebase, you can use the `getDefaultClient` method.

```javascript
import { getDefaultClient } from "micro-graphql-react";

const client = getDefaultClient();
```

### Client options

<!-- prettier-ignore -->
| Option  | Description |
| -------| ----------- |
| `endpoint` | URL for your GraphQL endpoint |
| `fetchOptions`  | Options to send along with all fetches|
| `cacheSize`  | Default cache size to use for all caches created by this client, as needed, for all queries it processes|

### Client api

<!-- prettier-ignore -->
| Option  | Description |
| -------| ----------- |
| <code class="small">runQuery(query: String, variables?: Object)</code> | Manually run this GraphQL query |
| `runMutation(mutation: String, variables?: Object)`  | Manually run this GraphQL mutation|
| `forceUpdate(query)`  | Manually update any components rendering that query. This is useful if you (dangerously) update a query's cache, as discussed in the caching section, below|

## Running queries and mutations

### Preloading queries

Regardless of whether you're using Suspense, it's a good idea to preload a query as soon as you know it'll be requested downstream by a (possibly lazy loaded) component. To preload a query, just call the `preload` method on the client, and pass a query, and any args you might have.

```javascript
import { getDefaultClient } from "micro-graphql-react";

const client = getDefaultClient();
client.preload(YourQuery, variables);
```

### Hooks

This project exports a `useQuery`, `useSuspenseQuery`, and `useMutation` hook.

```javascript
import { useQuery, useMutation, buildQuery, buildMutation } from "micro-graphql-react";

const ComponentWithQueryAndMutation = props => {
  let { loading, loaded, data, currentQuery } = useQuery(buildQuery(basicQuery, { query: props.query }, options));
  let { running, finished, runMutation } = useMutation(buildMutation("someMutation{}"));

  return <DoStuff {...props} {...{ loading, loaded, currentQuery, data, running, runMutation }} />;
};
```

### Building queries

Construct each query with the `buildQuery` method. The first argument is the query text itself. The second, optional argument, is the query's variables. You can also pass a third options argument, which can contain any of the following properties:

<!-- prettier-ignore -->
| Option  | Description |
| -------| ----------- |
| `onMutation` | A map of mutations, along with handlers. This is how you update your cached results after mutations, and is explained more fully below |
| `client`  | Manually pass in a client to be used for this query, which will override the default client|
| `cache`  | Manually pass in a cache object to be used for this query|
| `active`  | If passed, and if false, disables any further query loading. If not specified, the hook will update automatically, as expected |

Be sure to use the `compress` tag to remove un-needed whitespace from your query text, since it will be sent via HTTP GET—for more information, see [here](compress/).

An even better option would be to use my [persisted queries helper](https://github.com/arackaf/generic-persistgraphql). This not only removes the entire query text from your network requests altogether, but also from your bundled code.

### Props passed for each query

For each query you specify, an object will be returned from the hook, or for render props, passed in the callback's props by that same name, with the following properties.

<!-- prettier-ignore -->
| Props | Description |
| ----- | ----------- |
|`loading`|Fetch is executing for your query|
|`loaded`|Fetch has finished executing for your query|
|`data`|If the last fetch finished successfully, this will contain the data returned, else null|
|`currentQuery`|The query that was run, which produced the current results. This updates synchronously with updates to `data`, so you can use changes here as an easy way to subscribe to query result changes. This will not have a value until there are results passed to `data`. In other words, changes to `loading` do not affect this value|
|`error`|If the last fetch did not finish successfully, this will contain the errors that were returned, else `null`|
|`reload`|A function you can call to manually re-fetch the current query|
|`clearCache`|Clear the cache for this query|
|`clearCacheAndReload`|Calls `clearCache`, followed by `reload`|

### Building mutations

Construct each mutation with the `buildMutation` method. The first argument is the mutation text. The second, optional options argument can accept only a `client` property, which will override the client default, same as with queries.

### Props passed for each mutation

For each mutation you specify, an object will be passed in the component's props by that same name, with the following properties.

<!-- prettier-ignore -->
| Props         | Description  |
| ------------- | --------- |
| `running`     | Mutation is executing |
| `finished`    | Mutation has finished executing|
| `runMutation` | A function you can call when you want to run your mutation. Pass it an object with your variables |

### React Suspense

If you're using Suspense, just use the `useSuspenseQuery` hook. It has an identical api as `useQuery`, except it'll throw a promise whenever a data fetch is inflight, so your `useTransition()` calls and `Suspense` boundaries can respond accordingly.

## Caching

The client object maintains a cache of each query it comes across when processing your components. The cache is LRU with a default size of 10 and, again, stored at the level of each specific query, not the GraphQL type. As your instances mount and unmount, and update, the cache will be checked for existing results to matching queries.

### Cache object

You can import the `Cache` class like this

```javascript
import { Cache } from "micro-graphql-react";
```

When instantiating a new cache object, you can optionally pass in a cache size.

```javascript
let cache = new Cache(15);
```

#### Cache api

The cache object has the following properties and methods

<!-- prettier-ignore -->
| Member | Description  |
| ----- | --------- |
| `get entries()`   | An array of the current entries. Each entry is an array of length 2, of the form `[key, value]`. The cache entry key is the actual GraphQL url query that was run. If you'd like to inspect it, see the variables that were sent, etc, just use your favorite url parsing utility, like `url-parse`. And of course the cache value itself is whatever the server sent back for that query. If the query is still pending, then the entry will be a promise for that request. |
| `get(key)` | Gets the cache entry for a particular key      |
| `set(key, value)` | Sets the cache entry for a particular key  |
| `delete(key)`     | Deletes the cache entry for a particular key |
| `clearCache()`    | Clears all entries from the cache |

### Cache invalidation

The onMutation option that query options take is an object, or array of objects, of the form `{ when: string|regularExpression, run: function }`

`when` is a string or regular expression that's tested against each result of any mutations that finish. If the mutation has any matches, then `run` will be called with three arguments: an object with these propertes, described below, `{ softReset, currentResults, hardReset, cache, refresh }`; the entire mutation result; and the mutation's variables object.

<!-- prettier-ignore -->
| Arg  | Description  |
| ---| -------- |
| `softReset` | Clears the cache, but does **not** re-issue any queries. It can optionally take an argument of new, updated results, which will replace the current `data` props |
| `currentResults` | The current results that are passed as your `data` prop |
| `hardReset` | Clears the cache, and re-load the current query from the network|
| `cache`  | The actual cache object. You can enumerate its entries, and update whatever you need.|
| `refresh`   | Refreshes the current query, from cache if present. You'll likely want to call this after modifying the cache.  |

Many use cases follow. They're based on an hypothetical book tracking website since, if we're honest, the Todo example has been stretched to its limit—and also I built a book tracking website and so already have some data to work with :D

The code below was tested on an actual GraphQL endpoint created by my [mongo-graphql-starter project](https://github.com/arackaf/mongo-graphql-starter)

All examples use the `query` decorator, but the format is identical to the `GraphQL` component.

#### Use Case 1: Hard reset and reload after any mutation

Let's say that whenever a mutation happens, we want to immediately invalidate any related queries' caches, and reload the current queries from the network. We understand that this may cause a book that we just edited to immediately disappear from our current search results, since it no longer matches our search criteria, but that's what we want.

The hard reload method that's passed makes this easy. Let's see how to use this in a (contrived) component that queries, and displays some books.

```javascript
export const BookQueryComponent = props => (
  <div>
    <GraphQL
      query={{
        books: buildQuery(
          BOOKS_QUERY,
          { page: props.page },
          { onMutation: { when: /(update|create|delete)Books?/, run: ({ hardReset }) => hardReset() } }
        )
      }}
    >
      {({ books: { data } }) =>
        data ? (
          <ul>
            {data.allBooks.Books.map(b => (
              <li key={b._id}>
                {b.title} - {b.pages}
              </li>
            ))}
          </ul>
        ) : null
      }
    </GraphQL>
  </div>
);
```

Here we specify a regex matching every kind of book mutation we have, and upon completion, we just clear the cache, and reload by calling `hardReset()`. It's hard not to be at least a littler dissatisfied with this solution; the boilerplate is non-trivial. Let's take a look at a similar (again contrived) component, but for the subjects we can apply to books

```javascript
export const SubjectQueryComponent = props => (
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
```

Assuming our GraphQL operations have a consistent naming structure—and they should—then some pretty obvious patterns emerge. We can auto-generate this structure just from the name of our type, like so

```javascript
const hardResetStrategy = name => ({
  when: new RegExp(`(update|create|delete)${name}s?`),
  run: ({ hardReset }) => hardReset()
});
```

and then apply it like so

```javascript
export const BookQueryComponent = props => (
  <div>
    <GraphQL query={{ books: buildQuery(BOOKS_QUERY, { page: props.page }, { onMutation: hardResetStrategy("Book") }) }}>
      {({ books: { data } }) =>
        data ? (
          <ul>
            {data.allBooks.Books.map(b => (
              <li key={b._id}>
                {b.title} - {b.pages}
              </li>
            ))}
          </ul>
        ) : null
      }
    </GraphQL>
  </div>
);

export const SubjectQueryComponent = props => (
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
```

#### Use Case 2: Update current results, but otherwise clear the cache

Let's say that, upon successful mutation, you want to update your current results based on what was changed, clear all other cache entries, including the existing one, but **not** run any network requests. So if you're currently searching for an author of "Dumas Malone," but one of the current results was clearly written by Shelby Foote, and you click the book's edit button and fix it, you want that book to now show the updated values, but stay in the current results, since re-loading the current query and having the book just vanish is bad UX in your opinion.

Here's the same books component as above, but with our new cache strategy

```javascript
export const BookQueryComponent = props => (
  <div>
    <GraphQL
      query={{
        books: buildQuery(
          BOOKS_QUERY,
          { page: props.page },
          {
            onMutation: {
              when: "updateBook",
              run: ({ softReset, currentResults }, { updateBook: { Book } }) => {
                let CachedBook = currentResults.allBooks.Books.find(b => b._id == Book._id);
                CachedBook && Object.assign(CachedBook, Book);
                softReset(currentResults);
              }
            }
          }
        )
      }}
    >
      {({ books: { data } }) =>
        data ? (
          <ul>
            {data.allBooks.Books.map(b => (
              <li key={b._id}>
                {b.title} - {b.pages}
              </li>
            ))}
          </ul>
        ) : null
      }
    </GraphQL>
  </div>
);
```

Whenever a mutation comes back with `updateBook` results, we use `softReset` to update our current results, while clearing our cache, including the current cache result; so if you page up, then come back down to where you were, a **new** network request will be run, and your edited book will no longer be there, as expected. Note that in this example we're actually mutating our current cache result; that's fine.

This seems like a lot of boilerplate, but again, lets look at the subjects component and see if any patterns emerge.

```javascript
export const SubjectQueryComponent = props => (
  <div>
    <GraphQL
      query={{
        subjects: buildQuery(
          SUBJECTS_QUERY,
          { page: props.page },
          {
            onMutation: {
              when: "updateSubject",
              run: ({ softReset, currentResults }, { updateSubject: { Subject } }) => {
                let CachedSubject = currentResults.allSubjects.Subjects.find(s => s._id == Subject._id);
                CachedSubject && Object.assign(CachedSubject, Subject);
                softReset(currentResults);
              }
            }
          }
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
```

As before, since we've named our GraphQL operations consistently, there's some pretty obvious repetition. Let's again refactor this into a helper method that can be re-used throughout our app.

```javascript
const standardUpdateSingleStrategy = name => ({
  when: `update${name}`,
  run: ({ softReset, currentResults }, { [`update${name}`]: { [name]: updatedItem } }) => {
    let CachedItem = currentResults[`all${name}s`][`${name}s`].find(x => x._id == updatedItem._id);
    CachedItem && Object.assign(CachedItem, updatedItem);
    softReset(currentResults);
  }
});
```

Now we can clean up all that boilerplate from before

```javascript
export const BookQueryComponent = props => (
  <div>
    <GraphQL query={{ books: buildQuery(BOOKS_QUERY, { page: props.page }, { onMutation: standardUpdateSingleStrategy("Book") }) }}>
      {({ books: { data } }) =>
        data ? (
          <ul>
            {data.allBooks.Books.map(b => (
              <li key={b._id}>
                {b.title} - {b.pages}
              </li>
            ))}
          </ul>
        ) : null
      }
    </GraphQL>
  </div>
);

export const SubjectQueryComponent = props => (
  <div>
    <GraphQL query={{ subjects: buildQuery(SUBJECTS_QUERY, { page: props.page }, { onMutation: standardUpdateSingleStrategy("Subject") }) }}>
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
```

And if you have multiple mutations, just pass them in an array

#### Use Case 3: Manually update all affected cache entries

Let's say you want to intercept mutation results, and manually update your cache. This is difficult to get right, so be careful.

There's a `cache` object passed to the `run` callback, with an `entries` property you can iterate, and update. As before, it's fine to just mutate the cached entries directly; just don't forget to call the `refresh` method when done, so your current results will update.

This example shows how you can remove a deleted book from every cache result.

```javascript
export const BookQueryComponent = props => (
  <div>
    <GraphQL
      query={{
        books: buildQuery(
          BOOKS_QUERY,
          { page: props.page },
          {
            onMutation: {
              when: "deleteBook",
              run: ({ cache, refresh }, mutationResponse, args) => {
                cache.entries.forEach(([key, results]) => {
                  results.data.allBooks.Books = results.data.allBooks.Books.filter(b => b._id != args._id);
                });
                refresh();
              }
            }
          }
        )
      }}
    >
      {({ books: { data } }) =>
        data ? (
          <ul>
            {data.allBooks.Books.map(b => (
              <li key={b._id}>
                {b.title} - {b.pages}
              </li>
            ))}
          </ul>
        ) : null
      }
    </GraphQL>
  </div>
);
```

It's worth noting that this solution will have problems if your results are paged. Any non-active entries should really be purged and re-loaded when next needed, so a full, correct page of results will come back.

#### Use Case 4: Globally modify the cache as needed

Prior use cases have all relied on a component or hook to do the cache syncing or updating; however, you can also subscribe to mutation results directly on the relevant client instance, and clear or update cache entries as needed. For example

```javascript
graphqlClient.subscribeMutation({ when: /createBook/, run: () => clearCache(GetBooksQuery) });

//elsewhere
export const clearCache = (...cacheNames) => {
  cacheNames.forEach(name => {
    let cache = graphqlClient.getCache(name);
    cache && cache.clearCache();
  });
};
```

This code will clear all book search results whenever a new book is created, no matter if books are currently rendered anywhere by a hook. This ensures that if you create a book in a "create book" screen, and then browse back to a books query, no cached results will show, and instead a new query will run, so the new book will have a chance to show up in the new results (if it matches the search criteria).

Of course you can also subscribe to updates, and manually update your cache, subject to the same warnings as above. Be sure to call `graphqlClient.forceUpdate(queryName)` to broadcast your updates to any components rendering them.

#### A note on cache management code

There's always a risk with "micro" libraries resulting in more application code overall, since they do too little. Remember, this library passes on doing client-side cache updating not so that it can artificially shrink it's bundle size, but rather because this is a problem that's all but impossible to do in an automated way. Again, this is explained [here](./docs/readme-cache.md).

If you see a lot of repetative boilerplate being created in your app code to update caches, take a step back and make sure you're abstracting and generalizing appropriately. Make sure your GraphQL schema is as consistent as possible, so the work to keep the cache in sync will similarly be consistent and predictable, and therefore able to be reused.

## Manually running queries or mutations

It's entirely possible some pieces of data may need to be loaded from, and stored in your state manager, rather than fetched via a component's lifecycle; this is easily accomodated. The `GraphQL` component, and component decorators run their queries and mutations through the client object you're already setting via `setDefaultClient`. You can call those methods yourself, in your state manager (or anywhere).

### Client api

- `runQuery(query: String, variables?: Object)`
- `runMutation(mutation: String, variables?: Object)`

For example, to imperatively run the query from above in application code, you can do

```javascript
client.runQuery(
  compress`query ALL_BOOKS ($page: Int) {
    allBooks(PAGE: $page, PAGE_SIZE: 3) {
      Books { _id title }
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
      Book { _id title }
    }
  }`,
  { title: "New title" }
);
```

## Use in old browsers

By default this library ships modern, standard JavaScript, which should work in all decent browsers. If you have to support older browsers like IE, then just add the following alias to your webpack's resolve section

```javascript
  resolve: {
    alias: {
      "micro-graphql-react": "node_modules/micro-graphql-react/index-es5.js"
    },
    modules: [path.resolve("./"), path.resolve("./node_modules")]
  }
```
