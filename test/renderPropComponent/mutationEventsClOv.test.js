import { React, render, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { renderPropComponentFactory } from "../testUtils";

let client1;
let client2;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const getQueryAndMutationComponent = options =>
  renderPropComponentFactory(props => ({
    query: { q1: ["A", { query: props.query }, { ...options, client: client2 }] },
    mutation: { m1: ["someMutation{}", { client: client2 }] }
  }));

test("Mutation listener updates cache", async () => {
  let [getProps, Component] = getQueryAndMutationComponent({
    onMutation: {
      when: "updateBook",
      run: ({ cache }, { updateBook: { Book } }) => {
        cache.entries.forEach(([key, results]) => {
          let CachedBook = results.data.Books.find(b => b.id == Book.id);
          CachedBook && Object.assign(CachedBook, Book);
        });
      }
    }
  });

  client2.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "__WRONG__Eve" }] } };
  let { rerender } = render(<Component query="a" />);

  client2.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };
  rerender(<Component query="b" />);

  client2.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await getProps().m1.runMutation();

  expect(client2.queriesRun).toBe(2); //run for new query args

  rerender(<Component query="a" />);

  expect(client2.queriesRun).toBe(2); //still loads from cache
  expect(getProps().q1.data).toEqual({ Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] }); //loads updated data
});

test("Mutation listener updates cache with mutation args - string", async () => {
  let [getProps, Component] = getQueryAndMutationComponent({
    onMutation: {
      when: "deleteBook",
      run: ({ cache, refresh }, resp, args) => {
        cache.entries.forEach(([key, results]) => {
          results.data.Books = results.data.Books.filter(b => b.id != args.id);
          refresh();
        });
      }
    }
  });

  client2.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] } };
  let { rerender } = render(<Component query="a" />);

  client2.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };
  rerender(<Component query="b" />);

  client2.nextMutationResult = { deleteBook: { success: true } };
  await getProps().m1.runMutation({ id: 1 });

  expect(client2.queriesRun).toBe(2); //run for new query args
  expect(getProps().q1.data).toEqual({ Books: [] }); //loads updated data

  rerender(<Component query="a" />);

  expect(client2.queriesRun).toBe(2); //still loads from cache
  expect(getProps().q1.data).toEqual({ Books: [{ id: 2, title: "Book 2", author: "Eve" }] }); //loads updated data
});

test("Mutation listener updates cache with mutation args - regex", async () => {
  let [getProps, Component] = getQueryAndMutationComponent({
    onMutation: {
      when: /deleteBook/,
      run: ({ cache, refresh }, resp, args) => {
        cache.entries.forEach(([key, results]) => {
          results.data.Books = results.data.Books.filter(b => b.id != args.id);
          refresh();
        });
      }
    }
  });

  client2.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] } };
  let { rerender } = render(<Component query="a" />);

  client2.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };
  rerender(<Component query="b" />);

  client2.nextMutationResult = { deleteBook: { success: true } };
  await getProps().m1.runMutation({ id: 1 });

  expect(client2.queriesRun).toBe(2); //run for new query args
  expect(getProps().q1.data).toEqual({ Books: [] }); //loads updated data

  rerender(<Component query="a" />);

  expect(client2.queriesRun).toBe(2); //still loads from cache
  expect(getProps().q1.data).toEqual({ Books: [{ id: 2, title: "Book 2", author: "Eve" }] }); //loads updated data
});

test("Mutation listener updates cache then refreshes from cache", async () => {
  let [getProps, Component] = getQueryAndMutationComponent({
    onMutation: {
      when: "updateBook",
      run: ({ cache, refresh }, { updateBook: { Book } }, args) => {
        cache.entries.forEach(([key, results]) => {
          let newBooks = results.data.Books.map(b => {
            if (b.id == Book.id) {
              return Object.assign({}, b, Book);
            }
            return b;
          });
          //do this immutable crap just to make sure tests don't accidentally pass because of object references to current props being updated - in real life the component would not be re-rendered, but here's we're verifying the props directly
          let newResults = { ...results };
          newResults.data = { ...newResults.data };
          newResults.data.Books = newBooks;
          cache.set(key, newResults);
          refresh();
        });
      }
    }
  });

  client2.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "__WRONG__Eve" }] } };
  let { rerender } = render(<Component query="a" />);

  client2.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await getProps().m1.runMutation();

  expect(client2.queriesRun).toBe(1); //refreshed from cache
  expect(getProps().q1.data).toEqual({ Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] }); //refreshed with updated data
});

test("Mutation listener - soft reset - props right, cache cleared", async () => {
  let componentsCache;
  let [getProps, Component] = getQueryAndMutationComponent({
    onMutation: {
      when: "updateBook",
      run: ({ cache, softReset, currentResults }, { updateBook: { Book } }) => {
        componentsCache = cache;
        let CachedBook = currentResults.Books.find(b => b.id == Book.id);
        CachedBook && Object.assign(CachedBook, Book);
        softReset(currentResults);
      }
    }
  });

  client2.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "__WRONG__Eve" }] } };
  let { rerender } = render(<Component query="a" />);

  client2.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await getProps().m1.runMutation();

  expect(componentsCache.entries.length).toBe(0); //cache is cleared!
  expect(getProps().q1.data).toEqual({ Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] }); //updated data is now there
});

test("Mutation listener - hard reset - props right, cache cleared, client qeried", async () => {
  let componentsCache;
  let [getProps, Component] = getQueryAndMutationComponent({
    onMutation: {
      when: "updateBook",
      run: ({ cache, hardReset, currentResults }) => {
        componentsCache = cache;
        hardReset();
      }
    }
  });

  client2.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "__WRONG__Eve" }] } };
  let { rerender } = render(<Component query="a" />);

  expect(client2.queriesRun).toBe(1); //just the one
  client2.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] } };
  client2.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await getProps().m1.runMutation();

  expect(componentsCache.entries.length).toBe(1); //just the most recent entry
  expect(getProps().q1.data).toEqual({ Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] }); //updated data is now there
  expect(client2.queriesRun).toBe(2); //run from the hard reset
});
