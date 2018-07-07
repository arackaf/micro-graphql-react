import { React, Component, shallow, ClientMock, query, mutation, setDefaultClient, basicQuery } from "./testSuiteInitialize";

let client1;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const getQueryAndMutationComponent = queryArgs =>
  @mutation(`someMutation{}`)
  @query(...queryArgs)
  class extends Component {
    render = () => null;
  };

const queryPacket = [basicQuery, props => ({ page: props.page })];

test("Mutation listener runs with exact match", async () => {
  let runCount = 0;
  let Component = getQueryAndMutationComponent(queryPacket.concat({ onMutation: { when: "updateBook", run: () => runCount++ } }));
  let wrapper = shallow(<Component page={1} />).dive();

  client1.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await wrapper.props().runMutation();

  expect(runCount).toBe(1);
});

test("Mutation listener runs with exact match twice", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let Component = getQueryAndMutationComponent(
    queryPacket.concat({
      onMutation: [{ when: "updateBook", run: () => runCount++ }, { when: "updateBook", run: () => runCount2++ }]
    })
  );
  let wrapper = shallow(<Component page={1} />).dive();

  client1.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await wrapper.props().runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener runs with regex match", async () => {
  let runCount = 0;
  let Component = getQueryAndMutationComponent(queryPacket.concat({ onMutation: { when: /update/, run: () => runCount++ } }));
  let wrapper = shallow(<Component page={1} />).dive();

  client1.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await wrapper.props().runMutation();

  expect(runCount).toBe(1);
});

test("Mutation listener runs with regex match twice", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let Component = getQueryAndMutationComponent(
    queryPacket.concat({
      onMutation: [{ when: /book/i, run: () => runCount++ }, { when: /update/, run: () => runCount2++ }]
    })
  );
  let wrapper = shallow(<Component page={1} />).dive();

  client1.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await wrapper.props().runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener runs either test match", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let Component = getQueryAndMutationComponent(
    queryPacket.concat({
      onMutation: [{ when: "updateBook", run: () => runCount++ }, { when: /update/, run: () => runCount2++ }]
    })
  );
  let wrapper = shallow(<Component page={1} />).dive();

  client1.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await wrapper.props().runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener misses without match", async () => {
  let runCount = 0;
  let Component = getQueryAndMutationComponent(queryPacket.concat({ onMutation: { when: "updateBook", run: () => runCount++ } }));
  let wrapper = shallow(<Component page={1} />).dive();

  client1.nextMutationResult = { updateAuthor: { Author: { name: "New Name" } } };
  await wrapper.props().runMutation();

  expect(runCount).toBe(0);
});

test("Mutation listener destroys at unmount", async () => {
  let runCount = 0;
  let Component = getQueryAndMutationComponent(queryPacket.concat({ onMutation: { when: "updateBook", run: () => runCount++ } }));
  let wrapper = shallow(<Component page={1} />).dive();

  client1.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await wrapper.props().runMutation();
  expect(runCount).toBe(1);

  wrapper.unmount();

  await client1.processMutation();
  await client1.processMutation();
  await client1.processMutation();

  expect(runCount).toBe(1);
});
