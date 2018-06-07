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
