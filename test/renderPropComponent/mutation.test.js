import { React, render, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { renderPropComponentFactory } from "../testUtils";

let client1;
let ComponentA;
let getProps;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  [getProps, ComponentA] = getComponent();
});

const getComponent = () => renderPropComponentFactory(props => ({ mutation: { mutation1: "A" } }));

test("Mutation function exists", () => {
  render(<ComponentA />);

  expect(typeof getProps().mutation1.runMutation).toBe("function");
  expect(getProps().mutation1.running).toBe(false);
  expect(getProps().mutation1.finished).toBe(false);
});

test("Mutation function calls", () => {
  render(<ComponentA />);
  getProps().mutation1.runMutation();

  expect(client1.mutationsRun).toBe(1);
});

test("Mutation function calls twice", () => {
  render(<ComponentA />);

  getProps().mutation1.runMutation();
  getProps().mutation1.runMutation();
  expect(client1.mutationsRun).toBe(2);
});
