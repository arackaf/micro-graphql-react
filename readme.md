[![npm version](https://img.shields.io/npm/v/micro-graphql-react.svg?style=flat)](https://www.npmjs.com/package/micro-graphql-react) [![Build Status](https://travis-ci.com/arackaf/micro-graphql-react.svg?branch=master)](https://travis-ci.com/arackaf/micro-graphql-react) [![codecov](https://codecov.io/gh/arackaf/micro-graphql-react/branch/master/graph/badge.svg)](https://codecov.io/gh/arackaf/micro-graphql-react) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# micro-graphql-react

A light (2.5K min+gzip) and simple solution for painlessly connecting your React components to a GraphQL endpoint.

This project differs significantly from other GraphQL clients in how it approaches cache invalidation. Rather than adding metadata to all queries and forming a normalized cache, which is managed automatically, it does none of that, and instead provides simple, low-level building blocks to handle cache management yourself. The reason for this ostensibly poor tradeoff is because of the difficulties I've had interacting with other GraphQL clients which attempted to do this. I consistently had difficulty getting the cache to behave exactly as I wanted, and so decided to build a GraphQL client that allowed me to easily put together whatever cache invalidation schemes I wanted. This project is the result.

## Common cache difficulties other GraphQL clients contend with

**Live Demo**

To see a live demo of this library managing GraphQL requests, check out this [Code Sandbox](https://codesandbox.io/s/l2z74x2687)

**A note on cache invalidation**

This library will _not_ add metadata to your queries, and attempt to automatically update your cached entries from mutation results. The reason, quite simply, is because this is a hard problem, and no existing library handles it completely. Rather than try to solve this, you're given some simple primitives which allow you to specify how given mutations should affect cached results. It's slightly more work, but it allows you to tailor your solution to your app's precise needs, and, given the predictable, standard nature of GraphQL results, composes well. This is all explained at length below.

For more information on the difficulties of GraphQL caching, see [this explanation](./docs/readme-cache.md)


