import { React, render, Component, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { pause, hookComponentFactory, deferred, resolveDeferred } from "../testUtils";

let client1;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const getQueryAndMutationComponent = hookComponentFactory(["A", props => ({ query: props.query })], "someMutation{}");

test("Mutation listener updates cache X", async () => {
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({
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

  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "__WRONG__Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);
  await pause();

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };

  rerender(<Component query="b" />);
  await pause();

  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  mutationProps().runMutation();

  expect(client1.queriesRun).toBe(2); //run for new query args

  rerender(<Component query="a" />);
  await pause();

  expect(client1.queriesRun).toBe(2); //still loads from cache
  expect(queryProps().data).toEqual({
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "Eve" }
    ]
  }); //loads updated data
});

test("Mutation listener updates cache with mutation args - string", async () => {
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({
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

  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);
  await pause();

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };
  rerender(<Component query="b" />);
  await pause();

  client1.nextMutationResult = { deleteBook: { success: true } };
  await mutationProps().runMutation({ id: 1 });

  expect(client1.queriesRun).toBe(2); //run for new query args
  expect(queryProps().data).toEqual({ Books: [] }); //loads updated data

  rerender(<Component query="a" />);
  await pause();

  expect(client1.queriesRun).toBe(2); //still loads from cache
  expect(queryProps().data).toEqual({ Books: [{ id: 2, title: "Book 2", author: "Eve" }] }); //loads updated data
});

test("Mutation listener updates cache with mutation args - string - component gets new data", async () => {
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({
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

  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);
  await pause();

  expect(queryProps().data).toEqual({
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "Eve" }
    ]
  }); //loads updated data

  client1.nextMutationResult = { deleteBook: { success: true } };
  await mutationProps().runMutation({ id: 1 });

  expect(queryProps().data).toEqual({
    Books: [{ id: 2, title: "Book 2", author: "Eve" }]
  }); //loads updated data
});

test("Mutation listener updates cache with mutation args - regex", async () => {
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({
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

  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };
  rerender(<Component query="b" />);
  await pause();

  client1.nextMutationResult = { deleteBook: { success: true } };
  await mutationProps().runMutation({ id: 1 });

  expect(client1.queriesRun).toBe(2); //run for new query args
  expect(queryProps().data).toEqual({ Books: [] }); //loads updated data

  rerender(<Component query="a" />);
  await pause();

  expect(client1.queriesRun).toBe(2); //still loads from cache
  expect(queryProps().data).toEqual({ Books: [{ id: 2, title: "Book 2", author: "Eve" }] }); //loads updated data
});

test("Mutation listener updates cache then refreshes from cache", async () => {
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({
    onMutation: {
      when: "updateBook",
      run: ({ cache, refresh }, { updateBook: { Book } }) => {
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

  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "__WRONG__Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);
  await pause();

  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await mutationProps().runMutation();
  await pause();

  expect(client1.queriesRun).toBe(1); //refreshed from cache
  expect(queryProps().data).toEqual({
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "Eve" }
    ]
  }); //refreshed with updated data
});

test("Mutation listener - soft reset - props right, cache cleared", async () => {
  let componentsCache;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({
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

  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "__WRONG__Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);
  await pause();

  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await mutationProps().runMutation();

  expect(componentsCache.entries.length).toBe(0); //cache is cleared!
  expect(queryProps().data).toEqual({
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "Eve" }
    ]
  }); //updated data is now there
});

test("Mutation listener - soft reset - re-render does not re-fetch", async () => {
  let componentsCache;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({
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

  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "__WRONG__Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);
  await pause();

  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "__WRONG__Eve" }
      ]
    }
  };

  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await mutationProps().runMutation();

  expect(queryProps().data).toEqual({
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "Eve" }
    ]
  }); //updated data is now there

  rerender(<Component query="a" />);
  await pause();

  expect(queryProps().data).toEqual({
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "Eve" }
    ]
  }); //updated data is now there
});

test("Mutation listener - soft reset - re-render when you come back", async () => {
  let componentsCache;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({
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

  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "__WRONG__Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);
  await pause();

  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "XXXXXX" }
      ]
    }
  };

  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve New" } } };
  await mutationProps().runMutation();
  await pause();

  expect(queryProps().data).toEqual({
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "Eve New" }
    ]
  }); //updated data is now there

  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "Eve 2" }
      ]
    }
  };

  rerender(<Component query="b" />);
  await pause();

  expect(queryProps().data).toEqual({
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "Eve 2" }
    ]
  });

  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "Eve 3" }
      ]
    }
  };

  rerender(<Component query="a" />);
  await pause();

  expect(queryProps().data).toEqual({
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "Eve 3" }
    ]
  });
});

test("Mutation listener - hard reset - props right, cache cleared, client qeried", async () => {
  let componentsCache;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({
    onMutation: {
      when: "updateBook",
      run: ({ cache, hardReset, currentResults }) => {
        componentsCache = cache;
        hardReset();
      }
    }
  });

  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "__WRONG__Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" />);

  expect(client1.queriesRun).toBe(1); //just the one
  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "Eve" }
      ]
    }
  };
  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await mutationProps().runMutation();
  await pause();

  expect(componentsCache.entries.length).toBe(1); //just the most recent entry
  expect(queryProps().data).toEqual({
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "Eve" }
    ]
  }); //updated data is now there
  expect(client1.queriesRun).toBe(2); //run from the hard reset
});
