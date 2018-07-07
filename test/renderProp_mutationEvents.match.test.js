import { React, Component, shallow, mount, ClientMock, GraphQL, setDefaultClient, basicQuery } from "./testSuiteInitialize";

let client1;
let latestProps;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const getQueryAndMutationComponent = options =>
  class extends Component {
    render() {
      let props = this.props;
      return (
        <GraphQL query={{ q1: [basicQuery, { page: props.page }, options] }} mutation={{ m1: ["someMutation{}"] }}>
          {props => ((latestProps = props), null)}
        </GraphQL>
      );
    }
  };

test("Mutation listener runs with exact match", async () => {
  let runCount = 0;
  let Component = getQueryAndMutationComponent({ onMutation: { when: "updateBook", run: () => runCount++ } });
  let obj = mount(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await latestProps.m1.runMutation();

  expect(runCount).toBe(1);
});

test("Mutation listener runs with exact match twice", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let Component = getQueryAndMutationComponent({
    onMutation: [{ when: "updateBook", run: () => runCount++ }, { when: "updateBook", run: () => runCount2++ }]
  });
  let obj = mount(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await latestProps.m1.runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener runs with regex match", async () => {
  let runCount = 0;
  let Component = getQueryAndMutationComponent({ onMutation: { when: /update/, run: () => runCount++ } });
  let obj = mount(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await latestProps.m1.runMutation();

  expect(runCount).toBe(1);
});

test("Mutation listener runs with regex match twice", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let Component = getQueryAndMutationComponent({
    onMutation: [{ when: /book/i, run: () => runCount++ }, { when: /update/, run: () => runCount2++ }]
  });
  let obj = mount(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await latestProps.m1.runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener runs either test match", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let Component = getQueryAndMutationComponent({
    onMutation: [{ when: "updateBook", run: () => runCount++ }, { when: /update/, run: () => runCount2++ }]
  });
  let obj = mount(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await latestProps.m1.runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener misses without match", async () => {
  let runCount = 0;
  let Component = getQueryAndMutationComponent({ onMutation: { when: "updateBook", run: () => runCount++ } });
  let obj = mount(<Component page={1} />);

  client1.nextMutationResult = { updateAuthor: { Author: { name: "New Name" } } };
  await latestProps.m1.runMutation();

  expect(runCount).toBe(0);
});

test("Mutation listener destroys at unmount", async () => {
  let runCount = 0;
  let Component = getQueryAndMutationComponent({ onMutation: { when: "updateBook", run: () => runCount++ } });
  let obj = mount(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await latestProps.m1.runMutation();
  expect(runCount).toBe(1);

  obj.unmount();

  await client1.processMutation();
  await client1.processMutation();
  await client1.processMutation();

  expect(runCount).toBe(1);
});
