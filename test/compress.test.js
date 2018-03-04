import compress from "../src/compress";

const title = `This    is    a      not   compressed`;

const query1 = compress`
  query ReadBooks () {
     allBooks ( title: "${title}" ) {
       Books {
         title
         publisher
       }
     }
  `;

const compressed1 = `query ReadBooks(){allBooks(title: "${title}"){Books{title publisher}}`;

test("Compress 1", async () => {
  expect(compressed1).toEqual(query1);
});
