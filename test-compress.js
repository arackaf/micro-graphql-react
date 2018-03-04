const compress = require("./src/compress");

const title = `This    is    a      not   compressed`;

const query = compress`
  query ReadBooks () {
     allBooks (title: "${title}") {
       Books {
         title
         publisher
       }
     }
  `;

const query2 = compress`
  query ReadBooks () {
     allBooks (title: "${title}") {
       ${compress`Books {
         title
         publisher
       }
     }`}
  `;

const query3 = compress`
  query ReadBooks () {
     allBooks (title: "This    will    incorrectly    be   compressed") {
       Books {
         title
         publisher
       }
     }
  `;

console.log(query);
console.log(query2);
console.log(query3);
