import { render } from "react-testing-library";
import { React, Component, shallow, mount, ClientMock, setDefaultClient, basicQuery, useQuery, useMutation } from "../testSuiteInitialize";

let client1;
let client2;
let latestProps;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const getQueryAndMutationComponent = options => {
  let currentProps = {};

  return [
    () => currentProps,
    props => {
      let q1 = useQuery([basicQuery, { page: props.page }, { ...options, client: client2 }]);
      let m1 = useMutation(["someMutation{}", { client: client2 }]);
      currentProps = { ...{ m1, q1 } };

      return null;
    }
  ];
};

test("Mutation listener runs with exact match", async () => {
  let runCount = 0;
  let [getProps, Component] = getQueryAndMutationComponent({ onMutation: { when: "updateBook", run: () => runCount++ } });
  render(<Component page={1} />);

  client2.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await getProps().m1.runMutation();

  expect(runCount).toBe(1);
});

test("Mutation listener runs with exact match twice", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let [getProps, Component] = getQueryAndMutationComponent({
    onMutation: [{ when: "updateBook", run: () => runCount++ }, { when: "updateBook", run: () => runCount2++ }]
  });
  render(<Component page={1} />);

  client2.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await getProps().m1.runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener runs with regex match", async () => {
  let runCount = 0;
  let [getProps, Component] = getQueryAndMutationComponent({ onMutation: { when: /update/, run: () => runCount++ } });
  render(<Component page={1} />);

  client2.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await getProps().m1.runMutation();

  expect(runCount).toBe(1);
});

test("Mutation listener runs with regex match twice", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let [getProps, Component] = getQueryAndMutationComponent({
    onMutation: [{ when: /book/i, run: () => runCount++ }, { when: /update/, run: () => runCount2++ }]
  });
  render(<Component page={1} />);

  client2.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await getProps().m1.runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener runs either test match", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let [getProps, Component] = getQueryAndMutationComponent({
    onMutation: [{ when: "updateBook", run: () => runCount++ }, { when: /update/, run: () => runCount2++ }]
  });
  render(<Component page={1} />);

  client2.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await getProps().m1.runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener misses without match", async () => {
  let runCount = 0;
  let [getProps, Component] = getQueryAndMutationComponent({ onMutation: { when: "updateBook", run: () => runCount++ } });
  render(<Component page={1} />);

  client2.nextMutationResult = { updateAuthor: { Author: { name: "New Name" } } };
  await getProps().m1.runMutation();

  expect(runCount).toBe(0);
});

test("Mutation listener destroys at unmount", async () => {
  let runCount = 0;
  let [getProps, Component] = getQueryAndMutationComponent({ onMutation: { when: "updateBook", run: () => runCount++ } });
  let { unmount } = render(<Component page={1} />);

  client2.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await getProps().m1.runMutation();
  expect(runCount).toBe(1);

  unmount();

  await client2.processMutation();
  await client2.processMutation();
  await client2.processMutation();

  expect(runCount).toBe(1);
});
