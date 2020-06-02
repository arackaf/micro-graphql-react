[![npm version](https://img.shields.io/npm/v/micro-graphql-react.svg?style=flat)](https://www.npmjs.com/package/micro-graphql-react) [![Build Status](https://travis-ci.com/arackaf/micro-graphql-react.svg?branch=master)](https://travis-ci.com/arackaf/micro-graphql-react) [![codecov](https://codecov.io/gh/arackaf/micro-graphql-react/branch/master/graph/badge.svg)](https://codecov.io/gh/arackaf/micro-graphql-react) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# micro-graphql-react

A light (2.5K min+gzip) and simple solution for painlessly connecting your React components to a GraphQL endpoint.

This project differs significantly from other GraphQL clients in how it approaches cache invalidation. Rather than adding metadata to all queries and forming a normalized cache, which is managed automatically, it does none of that, and instead provides simple, low-level building blocks to handle cache management yourself. The reason for this ostensibly poor tradeoff is because of the difficulties I've had interacting with other GraphQL clients which attempted to do this. I consistently had difficulty getting the cache to behave exactly as I wanted, and so decided to build a GraphQL client that allowed me to easily put together whatever cache invalidation schemes I wanted. This project is the result.

The cache management problems this project seeks to solve are described below. If these aren't problems you face, you'll probably be better off with a more well-established GraphQL solution like Urql or Apollo. 

## Common cache difficulties other GraphQL clients contend with

### Coordinating mutations with filtered result sets

A common problem with GraphQL clients is configuring when a certain mutation should not just update existing data results, but also, more importantly clear all other cache results, since the completed mutations might affect other queries' filters. For example, let's say you run

```graphql
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

```graphql
mutation {
  updateTask(id: 1, assignedTo: "Bob", description: "Bob's Task")
}
```

the original query from above will usually now return

```json
[
  { "id": 1, "description": "Bob's Task", "assignedTo": "Bob" },
  { "id": 2, "description": "Adam's Task 2", "assignedTo": "Adam" }
];
```

which is wrong, since task number 1 should no longer be in this result set at all, since the assignedTo value has changed, which is what we were filtering against. 

---

This library solves this problem by allowing you to easily declare that a given mutation should clear all cache entries for a given query, and reload them from the network (hard reset), or just update the on-screen results, but otherwise clear the cache for a given query (soft reset).  See the [docs](https://arackaf.github.io/micro-graphql-react/) for more info.

### Properly processing empty result sets

An interesting approach that the first version of Urql took was to, after any mutation, invalidate any and all queries which dealt with the data type you just mutated. This is a lot closer in terms of correctness, but even here there are edge cases which GraphQL's limited type introspection make difficult. For example, let's say you run this query

```graphql
tasks(assignedTo: "Adam") {
  Tasks {
    id, description, assignedTo
  }
}
```

and get back

```json
{
  "data": {
    "tasks": {
      "__typename": "TaskQueryResults",
      "Tasks": []
    }
  }
}
```

It's more or less impossible for any GraphQL client to know what the underlying type of the empty `Tasks` array is, without a build step to introspect the entire endpoint's metadata. 

No single, automated solution will cover all use cases.

**Live Demo**

To see a live demo of this library managing GraphQL requests, check out this [Code Sandbox](https://codesandbox.io/s/l2z74x2687)

**A note on cache invalidation**

This library will _not_ add metadata to your queries, and attempt to automatically update your cached entries from mutation results. The reason, quite simply, is because this is a hard problem, and no existing library handles it completely. Rather than try to solve this, you're given some simple primitives which allow you to specify how given mutations should affect cached results. It's slightly more work, but it allows you to tailor your solution to your app's precise needs, and, given the predictable, standard nature of GraphQL results, composes well. This is all explained at length below.

For more information on the difficulties of GraphQL caching, see [this explanation](./docs/readme-cache.md)


