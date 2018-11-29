import { React, Component, shallow, mount, ClientMock, setDefaultClient, basicQuery, useQuery, useMutation } from "../testSuiteInitialize";

let client1;
let latestProps;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const getQueryAndMutationComponent = options => props => {
  let q1 = useQuery([basicQuery, { page: props.page }, options]);
  let m1 = useMutation(["someMutation{}"]);

  latestProps = { ...props, m1, q1 };
  return null;
};

test("Mutation listener runs with exact match", async () => {
  let runCount = 0;
  let Component = getQueryAndMutationComponent({ onMutation: { when: "updateBook", run: () => runCount++ } });
  let wrapper = mount(<Component page={1} />);

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
  let wrapper = mount(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await latestProps.m1.runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener runs with regex match", async () => {
  let runCount = 0;
  let Component = getQueryAndMutationComponent({ onMutation: { when: /update/, run: () => runCount++ } });
  let wrapper = mount(<Component page={1} />);

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
  let wrapper = mount(<Component page={1} />);

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
  let wrapper = mount(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await latestProps.m1.runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener misses without match", async () => {
  let runCount = 0;
  let Component = getQueryAndMutationComponent({ onMutation: { when: "updateBook", run: () => runCount++ } });
  let wrapper = mount(<Component page={1} />);

  client1.nextMutationResult = { updateAuthor: { Author: { name: "New Name" } } };
  await latestProps.m1.runMutation();

  expect(runCount).toBe(0);
});

test("Mutation listener destroys at unmount", async () => {
  let runCount = 0;
  let Component = getQueryAndMutationComponent({ onMutation: { when: "updateBook", run: () => runCount++ } });
  let wrapper = mount(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await latestProps.m1.runMutation();

  expect(runCount).toBe(1);

  wrapper.unmount();

  await client1.processMutation();
  await client1.processMutation();
  await client1.processMutation();

  expect(runCount).toBe(1);
});
