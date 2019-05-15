import { render } from "react-testing-library";
import { React, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { hookComponentFactory } from "../testUtils";

let client1;
let ComponentA;
let getProps;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  [getProps, ComponentA] = getComponentA();
});

const getComponentA = hookComponentFactory("A");

test("Mutation function exists", () => {
  render(<ComponentA />);

  expect(typeof getProps().runMutation).toBe("function");
  expect(getProps().running).toBe(false);
  expect(getProps().finished).toBe(false);
});

test("Mutation function calls", () => {
  render(<ComponentA />);
  getProps().runMutation();

  expect(client1.mutationsRun).toBe(1);
});

test("Mutation function calls twice", () => {
  render(<ComponentA />);
  getProps().runMutation();
  getProps().runMutation();

  expect(client1.mutationsRun).toBe(2);
});
