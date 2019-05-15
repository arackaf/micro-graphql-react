import { render } from "react-testing-library";
import { React, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { hookComponentFactory } from "../testUtils";

let client1;
let client2;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const getComponentA = hookComponentFactory("A");
const getComponentB = hookComponentFactory("A", "B");

test("Mutation function exists", () => {
  let [getProps, ComponentA] = getComponentA({ client: client2 });
  render(<ComponentA />);

  expect(typeof getProps().runMutation).toBe("function");
  expect(getProps().running).toBe(false);
  expect(getProps().finished).toBe(false);
});

test("Mutation function calls", () => {
  let [getProps, ComponentA] = getComponentA({ client: client2 });
  render(<ComponentA />);
  getProps().runMutation();

  expect(client2.mutationsRun).toBe(1);
});

test("Mutation function calls", () => {
  let [getProps1, getProps2, ComponentB] = getComponentB({ client: client2 }, { client: client2 });
  render(<ComponentB />);

  getProps1().runMutation();
  getProps2().runMutation();

  expect(client2.mutationsRun).toBe(2);
});
