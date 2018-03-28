# GraphQL Cache Invalidation

This page describes how other GraphQL libraries handle client-side caching, how those solutions fail for me, and how this library handles it instead.

## Apollo

Apollo parses all of your query and mutation results, and updates the client cache as things change. For example, let's say you run

```javascript
tasks(assignedTo: "Adam") {
  Tasks {
    id, description, assignedTo
  }
}
```

and get back

```javascript
[
  { id: 1, description: "Adam's Task 1", assignedTo: "Adam" },
  { id: 2, description: "Adam's Task 2", , assignedTo: "Adam" }
];
```

Now, if you subsequently run something like

```javascript
mutation {
  updateTask(id: 1, assignedTo: "Bob", description: "Bob's Task")
}
```

Apollo will dutifully modify the orignial query from above to now return

```javascript
[
  { id: 1, description: "Bob's Task", assignedTo: "Bob" },
  { id: 2, description: "Adam's Task 2", , assignedTo: "Adam" }
];
```

which is horribly wrong, since task number 1 should no longer be in this result set at all—but Apollo has absolutely no way of knowing this, without re-running the same query. Apollo has escape hatches, of course, for you to manually purge the cache.

## urql

`urql` takes a different approach, and, after any mutation, invalidates any and all queries which deal with the data type you just mutated. This is a lot closer, but even still, in most applications you'll likely be modifying data outside of the GraphQL workflow, and so still be in a position where you have to manuallly invalidate your cache.

## micro-graphql-react

This library takes a different approach, and doesn't presume to have this problem solved, leaving you to handle this on your own, which you probably would have, anyway. The simplest way to do this is to have your queries include some sort of version number.

```javascript
compress`
  query ALL_BOOKS_V_${version} {
    allBooks(
      PAGE: ${bookSearchState.page}
      PAGE_SIZE: ${bookSearchState.pageSize}
      SORT: ${sortObject}
      title_contains: bookSearchState.search
    ){
      Books{
        _id
        title
        isbn
        pages
        smallImage
        publicationDate
        subjects
        authors
        publisher
        isRead
      }, Meta {count}
    }
  }`;
```

which you change in your state manager as needed. In Redux, it might look something like this

```javascript
  case BOOK_SAVED:
  case BOOK_READ_CHANGED:
  case BOOK_DELETED:
  case MANUAL_BOOK_SAVED:
  case EDITING_BOOK_SAVED:
  case SET_BOOKS_SUBJECTS:
  case SET_BOOKS_TAGS:
    return { ...state, searchVersion: +new Date() };
```

Again, the decision to punt on cache invalidation was driven primarily by the fact that all existing solutions are insufficient, at least for my own use cases. Since I would usually have to manually declare that existing caches need to be updated anyway, it made sense to me to just leave all cache invalidation responsibilities to application code, and in the process greatly reduce bundle size for this library—which currently sits at just 2.1K min+gzip.

Needless to say, if you're happy to shut off client-side caching and eliminate the problem completely, you can just pass a `cacheSize` of zero, and you'll be good to go.

```javascript
@query(
  client,
  props => ({
    query: `
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
    cacheSize: 0
  }
)
class QueryWithOptions extends Component {
  render() {
    let { loading, loaded, data, reload, title, version } = this.props;
    return (
      <div>
        {loading ? <div>LOADING</div> : null}
        {loaded ? <div>LOADED</div> : null}
        <button onClick={reload}>reload</button>
        <br />
        {data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}
      </div>
    );
  }
}
```

---

Naturally, if the assumptions above don't apply to your application, and Apollo or urql work for you, then use them!
