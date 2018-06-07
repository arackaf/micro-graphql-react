export const BOOKS_QUERY = `
query ALL_BOOKS($page: Int) {
  allBooks(SORT: { title: 1 }, PAGE: $page, PAGE_SIZE: 3) {
    Books { _id title pages }
  }
}`;

export const BOOKS_MUTATION = `mutation modifyBook($_id: String, $title: String, $pages: Int) {
  updateBook(_id: $_id, Updates: { title: $title, pages: $pages }) {
    Book { _id title pages }
  }
}`;

export const BOOKS_MUTATION_MULTI = `mutation modifyBooks($_ids: [String], $title: String, $pages: Int) {
  updateBooks(_ids: $_ids, Updates: { title: $title, pages: $pages }) {
    Books { _id title pages }
  }
}`;

export const BOOK_DELETE = `mutation deleteBook($_id: [String], $title: String, $pages: Int) {
  deleteBook(_id: $_id) {
    { success }
  }
}`;

export const BOOK_CREATE = `mutation createBook($Book: BookInput) {
  createBook(Book: $Book) { Book { _id title } }
}`;

export const SUBJECTS_QUERY = `
query ALL_SUBJECTS($page: Int) {
  allSubjects(PAGE: $page, PAGE_SIZE: 3) {
    Subjects { _id name }
  }
}`;

export const SUBJECTS_MUTATION = `mutation modifySubject($_id: String, $name: String) {
  updateSubject(_id: $_id, Updates: { name: $name }) {
    Subject { _id name }
  }
}`;
