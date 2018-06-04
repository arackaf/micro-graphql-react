import { React, Component, shallow, ClientMock, query, mutation, setDefaultClient, basicQuery, basicQueryWithVariables } from "./testSuiteInitialize";

let client1;
let client2;
let client3;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint2");
  client3 = new ClientMock("endpoint3");
  setDefaultClient(client1);
});

const DEFAULT_CACHE_SIZE = 10;

const getQueryAndMutationComponent = queryArgs =>
  @mutation(`someMutation{}`)
  @query(...queryArgs)
  class extends Component {
    render = () => null;
  };

const queryPacket = [basicQueryWithVariables, props => ({ page: props.page })];
const queryPacket2 = [basicQueryWithVariables, props => ({ query: props.query })];

test("Mutation listener runs with exact match", async () => {
  let runCount = 0;
  let Component = getQueryAndMutationComponent(queryPacket.concat({ onMutation: { when: "updateBook", run: () => runCount++ } }));
  let obj = shallow(<Component page={1} />).dive();

  client1.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await obj.props().runMutation();

  expect(runCount).toBe(1);
});

test("Mutation listener runs with exact match", async () => {
  let runCount = 0;
  let Component = getQueryAndMutationComponent(queryPacket.concat({ onMutation: { when: "updateBook", run: () => runCount++ } }));
  let obj = shallow(<Component page={1} />).dive();

  client1.nextMutationResult = { updateAuthor: { Author: { name: "New Name" } } };
  await obj.props().runMutation();

  expect(runCount).toBe(0);
});

test("Mutation listener updates cache", async () => {
  let Component = getQueryAndMutationComponent(
    queryPacket2.concat({
      onMutation: {
        when: "updateBook",
        run: ({ updateBook: { Book } }, { cache }) => {
          cache.entries.forEach(([key, results]) => {
            let CachedBook = results.data.Books.find(b => b.id == Book.id);
            CachedBook && Object.assign(CachedBook, Book);
          });
        }
      }
    })
  );

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "__WRONG__Eve" }] } };
  let obj = shallow(<Component query="a" />).dive();
  await waitAndUpdate(obj);

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }] } };
  await setPropsAndWait(obj, { query: "b" });

  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await obj.props().runMutation();

  expect(client1.queriesRun).toBe(2); //run for new query args

  await setPropsAndWait(obj, { query: "a" });

  expect(client1.queriesRun).toBe(2); //still loads from cache
  expect(obj.props().data).toEqual({ Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] }); //loads updated data
});

test("Mutation listener - soft reset - props right, cache cleared", async () => {
  let componentsCache;
  let Component = getQueryAndMutationComponent(
    queryPacket2.concat({
      onMutation: {
        when: "updateBook",
        run: ({ updateBook: { Book } }, { cache, softReset, currentResults }) => {
          componentsCache = cache;
          let CachedBook = currentResults.Books.find(b => b.id == Book.id);
          CachedBook && Object.assign(CachedBook, Book);
          softReset(currentResults);
        }
      }
    })
  );

  client1.nextResult = { data: { Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "__WRONG__Eve" }] } };
  let obj = shallow(<Component query="a" />).dive();
  await waitAndUpdate(obj);

  client1.nextMutationResult = { updateBook: { Book: { id: 2, author: "Eve" } } };
  await obj.props().runMutation();

  expect(componentsCache.entries.length).toBe(0); //cache is cleared!
  expect(obj.props().data).toEqual({ Books: [{ id: 1, title: "Book 1", author: "Adam" }, { id: 2, title: "Book 2", author: "Eve" }] }); //updated data is now there
});

//console.log("current query", obj.instance().currentGraphqlQuery);
//console.log("instance", obj.props());

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
