import { React, render, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { hookComponentFactory } from "../testUtils";

let client1;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const getQueryAndMutationComponent = hookComponentFactory(["A", props => ({ page: props.page })], "someMutation{}");

test("Mutation listener runs with exact match", async () => {
  let runCount = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({ onMutation: { when: "updateBook", run: () => runCount++ } });
  render(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await mutationProps().runMutation();

  expect(runCount).toBe(1);
});

test("Mutation listener runs with exact match twice", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({
    onMutation: [{ when: "updateBook", run: () => runCount++ }, { when: "updateBook", run: () => runCount2++ }]
  });
  render(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await mutationProps().runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener runs with regex match", async () => {
  let runCount = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({ onMutation: { when: /update/, run: () => runCount++ } });
  render(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await mutationProps().runMutation();

  expect(runCount).toBe(1);
});

test("Mutation listener runs with regex match twice", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({
    onMutation: [{ when: /book/i, run: () => runCount++ }, { when: /update/, run: () => runCount2++ }]
  });
  render(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await mutationProps().runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener runs either test match", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({
    onMutation: [{ when: "updateBook", run: () => runCount++ }, { when: /update/, run: () => runCount2++ }]
  });
  render(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await mutationProps().runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener misses without match", async () => {
  let runCount = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({ onMutation: { when: "updateBook", run: () => runCount++ } });
  render(<Component page={1} />);

  client1.nextMutationResult = { updateAuthor: { Author: { name: "New Name" } } };
  await mutationProps().runMutation();

  expect(runCount).toBe(0);
});