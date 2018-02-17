export const basicQuery = `
  query ALL_BOOKS {
    allBooks(PAGE: 1, PAGE_SIZE: 3) {
      Books { 
        _id 
        title
        pages
      }
    }
  }`;

export const basicQueryWithVariables = `
  query ALL_BOOKS {
    allBooks(PAGE: 1, PAGE_SIZE: 3) {
      Books { 
        _id 
        title
        pages
      }
    }
  }`;
