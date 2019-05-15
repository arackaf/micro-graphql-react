import { render } from "react-testing-library";
import { React, ClientMock, setDefaultClient } from "../testSuiteInitialize";
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
    query: { q1: ["A", { page: props.page }, { ...options, client: client2 }] },
    mutation: { m1: ["someMutation{}", { client: client2 }] }
  }));

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
