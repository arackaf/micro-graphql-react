function gql(strings, ...expressions) {
  return encodeURIComponent(
    strings
      .map((string, i) => {
        const expression = i < expressions.length ? JSON.stringify(expressions[i]) : "";
        return string.replace(/\s+/g, " ") + expression;
      })
      .join("")
      .trim()
  );
}

const title = `Where's \` your \` god \` now`;

const query = gql`
  query ReadBooks () {
     allBooks (title: "${title}") {
       Books {
         title
         publisher
       }
     }
  `;

console.log(query);

try {
  gql("Hello world");
} catch (er) {
  console.log(er);
}

console.log("\n\n");
try {
  gql(query);
} catch (er) {
  console.log(er);
}
