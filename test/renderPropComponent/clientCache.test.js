import { render } from "react-testing-library";

import { React, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { renderPropComponentFactory } from "../testUtils";

const queryA = "A";
const queryB = "B";

let client1;
let ComponentA;
let getPropsA;
let ComponentB;
let getPropsB;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  [getPropsA, ComponentA] = getComponentA();
  [getPropsB, ComponentB] = getComponentB();
});

const getComponentA = options => renderPropComponentFactory(props => ({ query: { query1: [queryA, { a: props.a }] } }));
const getComponentB = options =>
  renderPropComponentFactory(props => ({ query: { query1: [queryA, { a: props.a }], query2: [queryB, { b: props.b }] } }));

test("Basic query fires on mount", () => {
  render(<ComponentA a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  expect(client1.queriesRun).toBe(1);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }]]);
});

test("Basic query does not re-fire for unrelated prop change", () => {
  let { rerender } = render(<ComponentA a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  rerender(<ComponentA a={1} unused={1} />);
  expect(client1.queriesRun).toBe(1);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }]]);
});

test("Basic query re-fires for prop change", () => {
  let { rerender } = render(<ComponentA a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  rerender(<ComponentA a={2} unused={0} />);

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryA, { a: 2 }]]);
});

test("Basic query hits cache", () => {
  let { rerender } = render(<ComponentA a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  rerender(<ComponentA a={2} unused={1} />);
  rerender(<ComponentA a={1} unused={1} />);

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryA, { a: 2 }]]);
});

test("Run two queries", () => {
  render(<ComponentB a={1} b={2} unused={0} />);

  expect(client1.queriesRun).toBe(2);

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);
});

test("Run two queries second updates", () => {
  let { rerender } = render(<ComponentB a={1} b={2} unused={0} />);

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);

  rerender(<ComponentB a={1} b={"2a"} unused={0} />);
  expect(client1.queriesRun).toBe(3);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }], [queryB, { b: "2a" }]]);
});

test("Run two queries second updates, then hits cache", () => {
  let { rerender } = render(<ComponentB a={1} b={2} unused={0} />);

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);

  rerender(<ComponentB a={1} b={"2a"} unused={0} />);

  expect(client1.queriesRun).toBe(3);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }], [queryB, { b: "2a" }]]);

  rerender(<ComponentB a={1} b={2} unused={0} />);
  expect(client1.queriesRun).toBe(3);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }], [queryB, { b: "2a" }]]);
});

test("Run two queries unrelated prop changes don't matter", () => {
  let { rerender } = render(<ComponentB a={1} b={2} unused={0} />);

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);

  rerender(<ComponentA a={1} b={2} unused={99} />);
  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);
});
