import compress from "../src/compress";

const title = `This    is    a      not   compressed`;

const query1 = compress`
  query ReadBooks {
    allBooks ( title : "${title}" ) {
       Books {
         title
         publisher
       }
    }
  }`;

const compressed1 = `query ReadBooks{allBooks(title:"${title}"){Books{title publisher}}}`;

test("Compress 1", async () => {
  expect(compressed1).toEqual(query1);
});

const query2 = compress`
  
     allBooks ( title : "${title}" ) {
      Books {
         title
         publisher
      }
    }
  `;

const compressed2 = `allBooks(title:"${title}"){Books{title publisher}}`;

test("Compress 2", async () => {
  expect(compressed2).toEqual(query2);
});

const query3 = compress`
  query twoQueries {
    ab1: allBooks ( title : "A" ) {
      Books {
         title
         publisher
      }
    }
    ab2: allBooks ( title : "B" ) {
      Books {
         title
         publisher
      }
    }
  }`;

const compressed3 = `query twoQueries{ab1:allBooks(title:"A"){Books{title publisher}}ab2:allBooks(title:"B"){Books{title publisher}}}`;

test("Compress 3", async () => {
  expect(compressed3).toEqual(query3);
});
