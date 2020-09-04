import { React, render, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { hookComponentFactory } from "../testUtils";

const getQueryAndMutationComponent = hookComponentFactory(["A", props => ({ page: props.page })], "someMutation{}");

test("Mutation listener destroys at unmount", async () => {
  let client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);

  let runCount = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({ onMutation: { when: "updateBook", run: () => runCount++ } });
  let { unmount } = render(<Component page={1} />);

  client1.nextMutationResult = { updateBook: { Book: { title: "New Title" } } };
  await mutationProps().runMutation();

  expect(runCount).toBe(1);

  unmount();

  await client1.processMutation();
  await client1.processMutation();
  await client1.processMutation();

  expect(runCount).toBe(1);
});

test("Mutation listener destroys at unmount", async () => {
  let client1 = new ClientMock("endpoint1");
  let client2 = new ClientMock("endpoint1");
  setDefaultClient(client1);

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

test("Refresh reference removes at unmount", async () => {
  let client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);

  let runCount = 0;
  let [queryProps, mutationProps, Component] = getQueryAndMutationComponent({ onMutation: { when: "updateBook", run: () => runCount++ } });
  let { unmount } = render(<Component page={1} />);

  expect(client1.forceListeners.get("A").size).toBe(1);
  
  unmount();
  
  expect(client1.forceListeners.get("A").size).toBe(0);
});