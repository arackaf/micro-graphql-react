import { React, render, Component, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { pause, hookComponentFactory } from "../testUtils";

let client1;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const getQueryAndMutationComponent = hookComponentFactory(["A", props => ({ query: props.query })], "someMutation{}");

test("Mutation listener updates cache X", async () => {
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(props => ({
    active: props.active,
    onMutation: {
      when: "updateBook",
      run: ({ cache }, { updateBook: { Book } }) => {
        cache.entries.forEach(([key, results]) => {
          let CachedBook = results.data.Books.find(b => b.id == Book.id);
          CachedBook && Object.assign(CachedBook, Book);
        });
      }
    }
  }));

  client1.nextResult = {
    data: {
      Books: [
        { id: 1, title: "Book 1", author: "Adam" },
        { id: 2, title: "Book 2", author: "__WRONG__Eve" }
      ]
    }
  };
  let { rerender } = render(<Component query="a" active={true} />);
  await pause();

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };

  rerender(<Component query="b" active={false} />);
  await pause();

  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  mutationProps().runMutation();

  expect(client1.queriesRun).toBe(1); //nothing loaded

  rerender(<Component query="a" active={false} />);
  await pause();

  expect(client1.queriesRun).toBe(1); //nothing's changed
  expect(queryProps().data).toEqual({
    //nothing's changed
    Books: [
      { id: 1, title: "Book 1", author: "Adam" },
      { id: 2, title: "Book 2", author: "__WRONG__Eve" }
    ]
  }); //loads updated data
});

test("Mutation listener updates cache with mutation args - string", async () => {
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(props => ({
    active: props.active,
    onMutation: {
      when: "deleteBook",
      run: ({ cache, refresh }, resp, args) => {
        cache.entries.forEach(([key, results]) => {
          results.data.Books = results.data.Books.filter(b => b.id != args.id);
          refresh();
        });
      }
    }
  }));

  let initialBooks = [
    { id: 1, title: "Book 1", author: "Adam" },
    { id: 2, title: "Book 2", author: "Eve" }
  ];
  client1.nextResult = {
    data: {
      Books: initialBooks
    }
  };
  let { rerender } = render(<Component query="a" active={true} />);
  await pause();

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };
  rerender(<Component query="b" active={false} />);
  await pause();

  client1.nextMutationResult = { deleteBook: { success: true } };
  await mutationProps().runMutation({ id: 1 });

  expect(client1.queriesRun).toBe(1); //nothing changed
  expect(queryProps().data).toEqual({ Books: initialBooks }); //loads updated data

  rerender(<Component query="a" active={false} />);
  await pause();

  expect(client1.queriesRun).toBe(1); //nothing changed
  expect(queryProps().data).toEqual({ Books: initialBooks }); //loads updated data
});

test("Mutation listener updates cache with mutation args - regex", async () => {
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(props => ({
    active: props.active,
    onMutation: {
      when: /deleteBook/,
      run: ({ cache, refresh }, resp, args) => {
        cache.entries.forEach(([key, results]) => {
          results.data.Books = results.data.Books.filter(b => b.id != args.id);
          refresh();
        });
      }
    }
  }));

  let initialBooks = [
    { id: 1, title: "Book 1", author: "Adam" },
    { id: 2, title: "Book 2", author: "Eve" }
  ];
  client1.nextResult = {
    data: {
      Books: initialBooks
    }
  };
  let { rerender } = render(<Component query="a" active={true} />);

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };
  rerender(<Component query="b" active={false} />);
  await pause();

  client1.nextMutationResult = { deleteBook: { success: true } };
  await mutationProps().runMutation({ id: 1 });

  expect(client1.queriesRun).toBe(1); // no change
  expect(queryProps().data).toEqual({ Books: initialBooks }); //no change

  rerender(<Component query="a" active={false} />);
  await pause();

  expect(client1.queriesRun).toBe(1); // no change
  expect(queryProps().data).toEqual({ Books: initialBooks }); //no change
});

test("Mutation listener updates cache then refreshes from cache", async () => {
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(props => ({
    active: props.active,
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
  }));

  let initialBooks = [
    { id: 1, title: "Book 1", author: "Adam" },
    { id: 2, title: "Book 2", author: "__WRONG__Eve" }
  ];
  client1.nextResult = {
    data: {
      Books: initialBooks
    }
  };
  let { rerender } = render(<Component query="a" active={false} />);
  await pause();

  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await mutationProps().runMutation();
  await pause();

  expect(client1.queriesRun).toBe(0); //never run
  expect(queryProps().data).toEqual(null); //refreshed with updated data
});

test("Mutation listener updates cache then refreshes from cache 2", async () => {
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(props => ({
    active: props.active,
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
  }));

  let initialBooks = [
    { id: 1, title: "Book 1", author: "Adam" },
    { id: 2, title: "Book 2", author: "__WRONG__Eve" }
  ];
  client1.nextResult = {
    data: {
      Books: initialBooks
    }
  };
  let { rerender } = render(<Component query="a" active={true} />);
  await pause();

  rerender(<Component query="a" active={false} />);
  await pause();

  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await mutationProps().runMutation();
  await pause();

  expect(client1.queriesRun).toBe(1); //run once
  expect(queryProps().data).toEqual({ Books: initialBooks }); //refreshed with updated data
});

test("Mutation listener - soft reset - props right, cache cleared", async () => {
  let componentsCache = null;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(props => ({
    active: props.active,
    onMutation: {
      when: "updateBook",
      run: ({ cache, softReset, currentResults }, { updateBook: { Book } }) => {
        componentsCache = cache;
        let CachedBook = currentResults.Books.find(b => b.id == Book.id);
        CachedBook && Object.assign(CachedBook, Book);
        softReset(currentResults);
      }
    }
  }));

  let initialBooks = [
    { id: 1, title: "Book 1", author: "Adam" },
    { id: 2, title: "Book 2", author: "__WRONG__Eve" }
  ];
  client1.nextResult = {
    data: {
      Books: initialBooks
    }
  };
  let { rerender } = render(<Component query="a" active={false} />);
  await pause();

  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await mutationProps().runMutation();

  expect(componentsCache).toBe(null); //no change
  expect(queryProps().data).toEqual(null); //nothing
});

test("Mutation listener - soft reset - props right, cache cleared 2", async () => {
  let componentsCache = null;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(props => ({
    active: props.active,
    onMutation: {
      when: "updateBook",
      run: ({ cache, softReset, currentResults }, { updateBook: { Book } }) => {
        componentsCache = cache;
        let CachedBook = currentResults.Books.find(b => b.id == Book.id);
        CachedBook && Object.assign(CachedBook, Book);
        softReset(currentResults);
      }
    }
  }));

  let initialBooks = [
    { id: 1, title: "Book 1", author: "Adam" },
    { id: 2, title: "Book 2", author: "__WRONG__Eve" }
  ];
  client1.nextResult = {
    data: {
      Books: initialBooks
    }
  };
  let { rerender } = render(<Component query="a" active={true} />);
  await pause();

  rerender(<Component query="a" active={false} />);
  await pause();

  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await mutationProps().runMutation();

  expect(componentsCache).toBe(null); //no change
  expect(queryProps().data).toEqual({ Books: initialBooks }); //nothing
});

test("Mutation listener - hard reset - props right, cache cleared, client qeried", async () => {
  let componentsCache = null;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(props => ({
    active: props.active,
    onMutation: {
      when: "updateBook",
      run: ({ cache, hardReset, currentResults }) => {
        componentsCache = cache;
        hardReset();
      }
    }
  }));

  let initialBooks = [
    { id: 1, title: "Book 1", author: "Adam" },
    { id: 2, title: "Book 2", author: "__WRONG__Eve" }
  ];
  client1.nextResult = {
    data: {
      Books: initialBooks
    }
  };

  let { rerender } = render(<Component query="a" active={false} />);
  await pause();

  expect(client1.queriesRun).toBe(0); //nothing
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

  expect(componentsCache).toBe(null); //just the initial entry
  expect(queryProps().data).toEqual(null); //nothing there
  expect(client1.queriesRun).toBe(0); //no run from the hard reset
});

test("Mutation listener - hard reset - props right, cache cleared, client qeried 2", async () => {
  let componentsCache = null;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(props => ({
    active: props.active,
    onMutation: {
      when: "updateBook",
      run: ({ cache, hardReset, currentResults }) => {
        componentsCache = cache;
        hardReset();
      }
    }
  }));

  let initialBooks = [
    { id: 1, title: "Book 1", author: "Adam" },
    { id: 2, title: "Book 2", author: "__WRONG__Eve" }
  ];
  client1.nextResult = {
    data: {
      Books: initialBooks
    }
  };

  let { rerender } = render(<Component query="a" active={true} />);
  await pause();

  rerender(<Component query="a" active={false} />);
  await pause();

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

  expect(componentsCache).toBe(null); //just the initial entry
  expect(queryProps().data).toEqual({
    Books: initialBooks
  }); //updated data is not there
  expect(client1.queriesRun).toBe(1); //no run from the hard reset
});
