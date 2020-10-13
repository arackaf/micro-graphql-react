import { React, render, Component, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { pause, hookComponentFactory } from "../testUtils";

let client1;
let client2;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const getQueryAndMutationComponent = hookComponentFactory(["A", props => ({ query: props.query })], "someMutation{}");

test("Mutation listener updates cache", async () => {
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(
    {
      onMutation: {
        when: "updateBook",
        run: ({ cache }, { updateBook: { Book } }) => {
          cache.entries.forEach(([key, results]) => {
            let CachedBook = results.data.Books.find(b => b.id == Book.id);
            CachedBook && Object.assign(CachedBook, Book);
          });
        }
      },
      client: client2
    },
    { client: client2 }
  );

  client2.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "__WRONG__Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);

  client2.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };
  rerender(<Component query="b" />);
  await pause();

  client2.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await mutationProps().runMutation();

  expect(client2.queriesRun).toBe(2); //run for new query args

  rerender(<Component query="a" />);
  await pause();

  expect(client2.queriesRun).toBe(2); //still loads from cache
  expect(queryProps().data).toEqual({
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "Eve" }
    ]
  }); //loads updated data
});

test("Mutation listener updates cache with mutation args - string", async () => {
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(
    {
      onMutation: {
        when: "deleteBook",
        run: ({ cache, refresh }, resp, args) => {
          cache.entries.forEach(([key, results]) => {
            results.data.Books = results.data.Books.filter(b => b.id != args.id);
            refresh();
          });
        }
      },
      client: client2
    },
    { client: client2 }
  );

  client2.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);

  client2.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };
  await rerender(<Component query="b" />);
  await pause();

  client2.nextMutationResult = { deleteBook: { success: true } };
  await mutationProps().runMutation({ id: 1 });

  expect(client2.queriesRun).toBe(2); //run for new query args
  expect(queryProps().data).toEqual({ Books: [] }); //loads updated data

  await rerender(<Component query="a" />);
  await pause();

  expect(client2.queriesRun).toBe(2); //still loads from cache
  expect(queryProps().data).toEqual({ Books: [{ id: 2, title: "Book 2", author: "Eve" }] }); //loads updated data
});

test("Mutation listener updates cache with mutation args - regex", async () => {
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(
    {
      onMutation: {
        when: /deleteBook/,
        run: ({ cache, refresh }, resp, args) => {
          cache.entries.forEach(([key, results]) => {
            results.data.Books = results.data.Books.filter(b => b.id != args.id);
            refresh();
          });
        }
      },
      client: client2
    },
    { client: client2 }
  );

  client2.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);

  client2.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };
  await rerender(<Component query="b" />);
  await pause();

  client2.nextMutationResult = { deleteBook: { success: true } };
  await mutationProps().runMutation({ id: 1 });

  expect(client2.queriesRun).toBe(2); //run for new query args
  expect(queryProps().data).toEqual({ Books: [] }); //loads updated data

  await rerender(<Component query="a" />);
  await pause();

  expect(client2.queriesRun).toBe(2); //still loads from cache
  expect(queryProps().data).toEqual({ Books: [{ id: 2, title: "Book 2", author: "Eve" }] }); //loads updated data
});

test("Mutation listener updates cache then refreshes from cache", async () => {
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(
    {
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
      },
      client: client2
    },
    { client: client2 }
  );

  client2.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "__WRONG__Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);

  client2.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await mutationProps().runMutation();
  await pause();

  expect(client2.queriesRun).toBe(1); //refreshed from cache
  expect(queryProps().data).toEqual({
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "Eve" }
    ]
  }); //refreshed with updated data
});

test("Mutation listener - soft reset - props right, cache cleared", async () => {
  let componentsCache;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(
    {
      onMutation: {
        when: "updateBook",
        run: ({ cache, softReset, currentResults }, { updateBook: { Book } }) => {
          componentsCache = cache;
          let CachedBook = currentResults.Books.find(b => b.id == Book.id);
          CachedBook && Object.assign(CachedBook, Book);
          softReset(currentResults);
        }
      },
      client: client2
    },
    { client: client2 }
  );

  client2.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "__WRONG__Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);

  client2.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await mutationProps().runMutation();
  await pause();

  expect(componentsCache.entries.length).toBe(0); //cache is cleared!
  expect(queryProps().data).toEqual({
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "Eve" }
    ]
  }); //updated data is now there
});

test("Mutation listener - hard reset - props right, cache cleared, client qeried", async () => {
  let componentsCache;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(
    {
      onMutation: {
        when: "updateBook",
        run: ({ cache, hardReset, currentResults }) => {
          componentsCache = cache;
          hardReset();
        }
      },
      client: client2
    },
    { client: client2 }
  );

  client2.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "__WRONG__Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);

  expect(client2.queriesRun).toBe(1); //just the one
  client2.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "Eve" }
      ]
    }
  };
  client2.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await mutationProps().runMutation();
  await pause();

  expect(componentsCache.entries.length).toBe(1); //just the most recent entry
  expect(queryProps().data).toEqual({
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "Eve" }
    ]
  }); //updated data is now there
  expect(client2.queriesRun).toBe(2); //run from the hard reset
});

test("Mutation listener - new component, re-queries", async () => {
  let componentsCache;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(
    {
      onMutation: {
        when: "updateBook",
        run: ({ cache, softReset, currentResults }, { updateBook: { Book } }) => {
          componentsCache = cache;
          let CachedBook = currentResults.Books.find(b => b.id == Book.id);
          CachedBook && Object.assign(CachedBook, Book);
          softReset(currentResults);
        }
      },
      client: client2
    },
    { client: client2 }
  );

  client2.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "__WRONG__Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);
  await pause();

  client2.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await mutationProps().runMutation();

  expect(componentsCache.entries.length).toBe(0); //cache is cleared!

  expect(client2.queriesRun).toBe(1);

  render(<Component query="a" />);
  await pause();
  expect(client2.queriesRun).toBe(2);
});
