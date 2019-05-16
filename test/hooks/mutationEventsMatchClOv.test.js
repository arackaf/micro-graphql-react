import { React, render, Component, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { hookComponentFactory } from "../testUtils";

let client1;
let client2;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const getQueryAndMutationComponent = hookComponentFactory(["A", props => ({ page: props.page })], "someMutation");

test("Mutation listener runs with exact match", async () => {
  let runCount = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(
    { onMutation: { when: "updateBook", run: () => runCount++ }, client: client2 },
    { client: client2 }
  );
  render(<Component page={1} />);

  client2.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await mutationProps().runMutation();

  expect(runCount).toBe(1);
});

test("Mutation listener runs with exact match twice", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(
    {
      onMutation: [{ when: "updateBook", run: () => runCount++ }, { when: "updateBook", run: () => runCount2++ }],
      client: client2
    },
    { client: client2 }
  );
  render(<Component page={1} />);

  client2.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await mutationProps().runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener runs with regex match", async () => {
  let runCount = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(
    { onMutation: { when: /update/, run: () => runCount++ }, client: client2 },
    { client: client2 }
  );
  render(<Component page={1} />);

  client2.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await mutationProps().runMutation();

  expect(runCount).toBe(1);
});

test("Mutation listener runs with regex match twice", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(
    {
      onMutation: [{ when: /book/i, run: () => runCount++ }, { when: /update/, run: () => runCount2++ }],
      client: client2
    },
    { client: client2 }
  );
  render(<Component page={1} />);

  client2.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await mutationProps().runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener runs either test match", async () => {
  let runCount = 0;
  let runCount2 = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(
    {
      onMutation: [{ when: "updateBook", run: () => runCount++ }, { when: /update/, run: () => runCount2++ }],
      client: client2
    },
    { client: client2 }
  );
  render(<Component page={1} />);

  client2.nextMutationResult = { updateBook: { Book: { title: "New Name" } } };
  await mutationProps().runMutation();

  expect(runCount).toBe(1);
  expect(runCount2).toBe(1);
});

test("Mutation listener misses without match", async () => {
  let runCount = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(
    { onMutation: { when: "updateBook", run: () => runCount++ }, client: client2 },
    { client: client2 }
  );
  render(<Component page={1} />);

  client2.nextMutationResult = { updateAuthor: { Author: { name: "New Name" } } };
  await mutationProps().runMutation();

  expect(runCount).toBe(0);
});

test("Mutation listener destroys at unmount", async () => {
  let runCount = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent(
    { onMutation: { when: "updateBook", run: () => runCount++ }, client: client2 },
    { client: client2 }
  );
  let { unmount } = render(<Component page={1} />);

  client2.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await mutationProps().runMutation();
  expect(runCount).toBe(1);

  unmount();

  await client2.processMutation();
  await client2.processMutation();
  await client2.processMutation();

  expect(runCount).toBe(1);
});
