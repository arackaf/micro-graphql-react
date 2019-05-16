import { React, render, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { renderPropComponentFactory } from "../testUtils";

let client1;
let client2;
let ComponentA;
let getPropsA;
let ComponentB;
let getPropsB;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  [getPropsA, ComponentA] = getComponentA();
  [getPropsB, ComponentB] = getComponentB();
});

const getComponentA = options => renderPropComponentFactory(props => ({ mutation: { mutation1: ["A", { client: client2 }] } }));
const getComponentB = options =>
  renderPropComponentFactory(props => ({ mutation: { mutation1: ["A", { client: client2 }], mutation2: ["B", { client: client2 }] } }));

test("Mutation function exists", () => {
  render(<ComponentA />);

  expect(typeof getPropsA().mutation1.runMutation).toBe("function");
  expect(getPropsA().mutation1.running).toBe(false);
  expect(getPropsA().mutation1.finished).toBe(false);
});

test("Mutation function calls", () => {
  render(<ComponentA />);
  getPropsA().mutation1.runMutation();

  expect(client2.mutationsRun).toBe(1);
});

test("Mutation function calls", () => {
  render(<ComponentB />);
  getPropsB().mutation1.runMutation();
  getPropsB().mutation2.runMutation();

  expect(client2.mutationsRun).toBe(2);
});
