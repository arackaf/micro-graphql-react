import { React, Component, mount, ClientMock, GraphQL, setDefaultClient, basicQuery } from "./testSuiteInitialize";

let client1;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

class Dummy extends Component {
  render() {
    return null;
  }
}

const getQueryAndMutationComponent = options =>
  class extends Component {
    render() {
      let props = this.props;
      return (
        <GraphQL query={{ q1: [basicQuery, { query: props.query }, options] }} mutation={{ m1: ["someMutation{}"] }}>
          {props => <Dummy {...props} />}
        </GraphQL>
      );
    }
  };

const queryPacket = [basicQuery, props => ({ query: props.query })];

const getQ1Data = obj =>
  obj
    .children()
    .find(Dummy)
    .props().q1.data;

const runM1Mutation = (obj, args) =>
  obj
    .children()
    .find(Dummy)
    .props()
    .m1.runMutation(args);

test("Mutation listener updates cache", async () => {
  let Component = getQueryAndMutationComponent({
    onMutation: {
      when: "updateBook",
      run: (args, { updateBook: { Book } }, { cache }) => {
        cache.entries.forEach(([key, results]) => {
          let CachedBook = results.data.Books.find(b => b.id == Book.id);
          CachedBook && Object.assign(CachedBook, Book);
        });
      }
    }
  });

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "__WRONG__Eve" }] } };
  let obj = mount(<Component query="a" />);

  await waitAndUpdate(obj);

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };
  await setPropsAndWait(obj, { query: "b" });

  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await runM1Mutation(obj);

  expect(client1.queriesRun).toBe(2); //run for new query args

  await setPropsAndWait(obj, { query: "a" });

  expect(client1.queriesRun).toBe(2); //still loads from cache
  expect(getQ1Data(obj)).toEqual({ Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] }); //loads updated data
});

test("Mutation listener updates cache with mutation args - string", async () => {
  let Component = getQueryAndMutationComponent({
    onMutation: {
      when: "deleteBook",
      run: (args, resp, { cache, refresh }) => {
        cache.entries.forEach(([key, results]) => {
          results.data.Books = results.data.Books.filter(b => b.id != args.id);
          refresh();
        });
      }
    }
  });

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] } };
  let obj = mount(<Component query="a" />);
  await waitAndUpdate(obj);

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };
  await setPropsAndWait(obj, { query: "b" });

  client1.nextMutationResult = { deleteBook: { success: true } };
  await runM1Mutation(obj, { id: 1 });

  expect(client1.queriesRun).toBe(2); //run for new query args
  expect(getQ1Data(obj)).toEqual({ Books: [] }); //loads updated data

  await setPropsAndWait(obj, { query: "a" });

  expect(client1.queriesRun).toBe(2); //still loads from cache
  expect(getQ1Data(obj)).toEqual({ Books: [{ id: 2, title: "Book 2", author: "Eve" }] }); //loads updated data
});

test("Mutation listener updates cache with mutation args - regex", async () => {
  let Component = getQueryAndMutationComponent({
    onMutation: {
      when: /deleteBook/,
      run: (args, resp, { cache, refresh }) => {
        cache.entries.forEach(([key, results]) => {
          results.data.Books = results.data.Books.filter(b => b.id != args.id);
          refresh();
        });
      }
    }
  });

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] } };
  let obj = mount(<Component query="a" />);
  await waitAndUpdate(obj);

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };
  await setPropsAndWait(obj, { query: "b" });

  client1.nextMutationResult = { deleteBook: { success: true } };
  await runM1Mutation(obj, { id: 1 });

  expect(client1.queriesRun).toBe(2); //run for new query args
  expect(getQ1Data(obj)).toEqual({ Books: [] }); //loads updated data

  await setPropsAndWait(obj, { query: "a" });

  expect(client1.queriesRun).toBe(2); //still loads from cache
  expect(getQ1Data(obj)).toEqual({ Books: [{ id: 2, title: "Book 2", author: "Eve" }] }); //loads updated data
});

test("Mutation listener updates cache then refreshes from cache", async () => {
  let Component = getQueryAndMutationComponent({
    onMutation: {
      when: "updateBook",
      run: (args, { updateBook: { Book } }, { cache, refresh }) => {
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

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "__WRONG__Eve" }] } };
  let obj = mount(<Component query="a" />);
  await waitAndUpdate(obj);

  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await runM1Mutation(obj);
  await waitAndUpdate(obj);

  expect(client1.queriesRun).toBe(1); //refreshed from cache
  expect(getQ1Data(obj)).toEqual({ Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] }); //refreshed with updated data
});

// test("Mutation listener - soft reset - props right, cache cleared", async () => {
//   let componentsCache;
//   let Component = getQueryAndMutationComponent(
//     queryPacket.concat({
//       onMutation: {
//         when: "updateBook",
//         run: (args, { updateBook: { Book } }, { cache, softReset, currentResults }) => {
//           componentsCache = cache;
//           let CachedBook = currentResults.Books.find(b => b.id == Book.id);
//           CachedBook && Object.assign(CachedBook, Book);
//           softReset(currentResults);
//         }
//       }
//     })
//   );

//   client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "__WRONG__Eve" }] } };
//   let obj = shallow(<Component query="a" />).dive();
//   await waitAndUpdate(obj);

//   client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
//   await obj.props().runMutation();

//   expect(componentsCache.entries.length).toBe(0); //cache is cleared!
//   expect(obj.props().data).toEqual({ Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] }); //updated data is now there
// });

// test("Mutation listener - hard reset - props right, cache cleared, client qeried", async () => {
//   let componentsCache;
//   let Component = getQueryAndMutationComponent(
//     queryPacket.concat({
//       onMutation: {
//         when: "updateBook",
//         run: (args, Resp, { cache, hardReset, currentResults }) => {
//           componentsCache = cache;
//           hardReset();
//         }
//       }
//     })
//   );

//   client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "__WRONG__Eve" }] } };
//   let obj = shallow(<Component query="a" />).dive();
//   await waitAndUpdate(obj);

//   expect(client1.queriesRun).toBe(1); //just the one
//   client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] } };
//   client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
//   await obj.props().runMutation();
//   await waitAndUpdate(obj);

//   expect(componentsCache.entries.length).toBe(1); //just the most recent entry
//   expect(obj.props().data).toEqual({ Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] }); //updated data is now there
//   expect(client1.queriesRun).toBe(2); //run from the hard reset
// });

async function setPropsAndWait(renderedComponent, props) {
  renderedComponent.setProps(props);
  await waitAndUpdate(renderedComponent);
}
function waitAndUpdate(renderedComponent) {
  return new Promise(res => {
    setTimeout(() => {
      renderedComponent.update();
      res();
    }, 1);
  });
}
