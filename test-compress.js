const compress = require("./src/compress");

const title = `This    is    a      not   compressed`;

const query = compress`
query ReadBooks {
   allBooks (title: "This    will    incorrectly    be   compressed") {
     Books {
       title
       publisher
     }
   }
`;

console.log(query);
