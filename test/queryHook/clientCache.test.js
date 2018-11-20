import { React, Component, mount, ClientMock, setDefaultClient, GraphQL, useQuery } from "../testSuiteInitialize";
import { verifyPropsFor, deferred, resolveDeferred } from "../testUtils";

const queryA = "A";
const queryB = "B";

let client1;
let ComponentA;
let ComponentB;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  ComponentA = getComponentA();
  ComponentB = getComponentB();
});

const getComponentA = (render = () => null) => props => {
  let queryProps = useQuery([queryA, { a: props.a }]);
  return <div />;
};

const getComponentB = (render = () => null) => props => {
  let query1Props = useQuery([queryA, { a: props.a }]);
  let query2Props = useQuery([queryB, { b: props.b }]);
  return <div />;
};

test("Basic query fires on mount", () => {
  let wrapper = mount(<ComponentA a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  expect(client1.queriesRun).toBe(1);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }]]);
});

test("Basic query does not re-fire for unrelated prop change", () => {
  let wrapper = mount(<ComponentA a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  wrapper.setProps({ unused: 1 });
  expect(client1.queriesRun).toBe(1);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }]]);
});

test("Basic query re-fires for prop change", () => {
  let wrapper = mount(<ComponentA a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  wrapper.setProps({ a: 2 });

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryA, { a: 2 }]]);
});

test("Basic query hits cache", () => {
  let wrapper = mount(<ComponentA a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  wrapper.setProps({ a: 2 });
  wrapper.setProps({ a: 1 });

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryA, { a: 2 }]]);
});

test("Run two queries", () => {
  let wrapper = mount(<ComponentB a={1} b={2} unused={0} />);

  expect(client1.queriesRun).toBe(2);

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);
});

test("Run two queries second updates", () => {
  let wrapper = mount(<ComponentB a={1} b={2} unused={0} />);

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);

  wrapper.setProps({ b: "2a" });
  expect(client1.queriesRun).toBe(3);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }], [queryB, { b: "2a" }]]);
});

test("Run two queries second updates, then hits cache", () => {
  let wrapper = mount(<ComponentB a={1} b={2} unused={0} />);

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);

  wrapper.setProps({ b: "2a" });
  expect(client1.queriesRun).toBe(3);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }], [queryB, { b: "2a" }]]);

  wrapper.setProps({ b: 2 });
  expect(client1.queriesRun).toBe(3);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }], [queryB, { b: "2a" }]]);
});

test("Run two queries unrelated prop changes don't matter", () => {
  let wrapper = mount(<ComponentB a={1} b={2} unused={0} />);

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);

  wrapper.setProps({ unused: 99 });
  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);
});
