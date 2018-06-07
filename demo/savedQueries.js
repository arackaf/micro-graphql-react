export const BOOKS_QUERY = `
query ALL_BOOKS($page: Int) {
  allBooks(PAGE: $page, PAGE_SIZE: 3) {
    Books { _id title pages }
  }
}`;

export const BOOKS_MUTATION = `mutation modifyBook($_id: String, $title: String, $pages: Int) {
  updateBook(_id: $_id, Updates: { title: $title, pages: $pages }) {
    Book { _id, title, pages }
  }
}`;
