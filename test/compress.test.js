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
  expect(query1).toEqual(compressed1);
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
  expect(query2).toEqual(compressed2);
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
  expect(query3).toEqual(compressed3);
});

const query4 = compress`
  query twoQueries ( $title1:  String , $title2 : String ) {
    ab1: allBooks ( title : $title1 ) {
      Books {
         title
         publisher
      }
    }
    ab2: allBooks ( title : $title2 ) {
      Books {
         title
         publisher
      }
    }
  }`;

const compressed4 = `query twoQueries($title1:String,$title2:String){ab1:allBooks(title:$title1){Books{title publisher}}ab2:allBooks(title:$title2){Books{title publisher}}}`;

test("Compress 4", async () => {
  expect(query4).toEqual(compressed4);
});
