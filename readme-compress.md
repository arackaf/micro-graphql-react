# The compress tag

Since queries are sent via HTTP GET, in order to allow for service worker caching, it's a good idea to keep the query's size under control with the `compress` tag. This removes all whitespace from the string itself, leaving all `${}` expressions untouched. For example,

```javascript
import { compress } from "micro-graphql-react";

const title = `This    is    a      not   compressed`;

compress`
  query ReadBooks () {
     allBooks (title: "${title}") {
       ${compress`Books {
         title
         publisher
       }
     }`}
  `;
```

returns

```javascript
query ReadBooks () { allBooks (title: "This    is    a      not   compressed") { Books { title publisher } }
```

If for some reason you need put some of your GraphQL query into a `${}` expression, just tag it with `compress`. For example,

```javascript
compress`
  query ReadBooks () {
     allBooks (title: "${title}") {
       ${`Books {
         title
         publisher
       }
     }`}
  `;
```

returns

```javascript
query ReadBooks () { allBooks (title: "This    is    a      not   compressed") { Books {
         title
         publisher
       }
     }
```

while

```javascript
compress`
  query ReadBooks () {
     allBooks (title: "${title}") {
       ${compress`Books {
         title
         publisher
       }
     }`}
  `;
```

returns

```javascript
query ReadBooks () { allBooks (title: "This    is    a      not   compressed") { Books { title publisher } }
```

as you'd expect.

Lastly, be sure to wrap any string values in `${}` so they're not modified, since

```javascript
compress`
  query ReadBooks () {
     allBooks (title: "This    will    incorrectly    be   compressed") {
       Books {
         title
         publisher
       }
     }
  `;
```

returns

```javascript
query ReadBooks () { allBooks (title: "This will incorrectly be compressed") { Books { title publisher } }
```
