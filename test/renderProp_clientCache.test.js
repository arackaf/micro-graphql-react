import { React, Component, mount, ClientMock, setDefaultClient, GraphQL } from "./testSuiteInitialize";
import { verifyPropsFor, deferred, resolveDeferred } from "./testUtils";

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

const getComponentA = (render = () => null) =>
  class extends Component {
    render() {
      return <GraphQL query={{ query1: [queryA, { a: this.props.a }] }}>{render}</GraphQL>;
    }
  };

const getComponentB = (render = () => null) =>
  class extends Component {
    render = () => <GraphQL query={{ query1: [queryA, { a: this.props.a }], query2: [queryB, { b: this.props.b }] }}>{render}</GraphQL>;
  };

test("Basic query fires on mount", () => {
  let obj = mount(<ComponentA a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  expect(client1.queriesRun).toBe(1);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }]]);
});

test("Basic query does not re-fire for unrelated prop change", () => {
  let obj = mount(<ComponentA a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  obj.setProps({ unused: 1 });
  expect(client1.queriesRun).toBe(1);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }]]);
});

test("Basic query re-fires for prop change", () => {
  let obj = mount(<ComponentA a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  obj.setProps({ a: 2 });

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryA, { a: 2 }]]);
});

test("Basic query hits cache", () => {
  let obj = mount(<ComponentA a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  obj.setProps({ a: 2 });
  obj.setProps({ a: 1 });

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryA, { a: 2 }]]);
});

test("Run two queries", () => {
  let obj = mount(<ComponentB a={1} b={2} unused={0} />);

  expect(client1.queriesRun).toBe(2);

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);
});

test("Run two queries second updates", () => {
  let obj = mount(<ComponentB a={1} b={2} unused={0} />);

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);

  obj.setProps({ b: "2a" });
  expect(client1.queriesRun).toBe(3);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }], [queryB, { b: "2a" }]]);
});

test("Run two queries second updates, then hits cache", () => {
  let obj = mount(<ComponentB a={1} b={2} unused={0} />);

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);

  obj.setProps({ b: "2a" });
  expect(client1.queriesRun).toBe(3);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }], [queryB, { b: "2a" }]]);

  obj.setProps({ b: 2 });
  expect(client1.queriesRun).toBe(3);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }], [queryB, { b: "2a" }]]);
});

test("Run two queries unrelated prop changes don't matter", () => {
  let obj = mount(<ComponentB a={1} b={2} unused={0} />);

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);

  obj.setProps({ unused: 99 });
  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }], [queryB, { b: 2 }]]);
});
