import { React, Component, mount, ClientMock, setDefaultClient, GraphQL } from "./testSuiteInitialize";

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

const DEFAULT_CACHE_SIZE = 10;

class DummyA extends Component {
  render() {
    return <div className="a" />;
  }
}

const letUpdate = obj => {
  return new Promise(res => setTimeout(res, 200)); //.then(() => obj.instance.forceUpdate());
};

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

const getPropsFor = (obj, target) =>
  obj
    .children()
    .find(target)
    .props();

const verifyPropsFor = (obj, target, expected) => {
  let props = getPropsFor(obj, target);
  expect(props).toEqual(expected);
};

test("Basic query fires on mount", () => {
  let obj = mount(<ComponentA a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  expect(client1.queriesRun).toBe(1);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }]]);
});

const getComponentWithDummyA = () =>
  getComponentA(props => {
    return <DummyA {...props.query1} />;
  });

test("loading props passed", async () => {
  ComponentA = getComponentWithDummyA();
  let obj = mount(<ComponentA a={1} unused={0} />);

  verifyPropsFor(obj, DummyA, {
    loading: true,
    loaded: false,
    data: null,
    error: null
  });
});

test("Query resolves and data updated", async () => {
  ComponentA = getComponentWithDummyA();
  let p = Promise.resolve({ data: { tasks: [] } });
  client1.nextResult = p;
  let obj = mount(<ComponentA a={1} unused={0} />);

  verifyPropsFor(obj, DummyA, {
    loading: true,
    loaded: false,
    data: null,
    error: null
  });

  await p;
  obj.update();

  verifyPropsFor(obj, DummyA, {
    loading: false,
    loaded: true,
    data: { tasks: [] },
    error: null
  });
});

test("Query resolves and errors updated", async () => {
  ComponentA = getComponentWithDummyA();
  let p = Promise.resolve({ errors: [{ msg: "a" }] });
  client1.nextResult = p;
  let obj = mount(<ComponentA a={1} unused={0} />);

  verifyPropsFor(obj, DummyA, {
    loading: true,
    loaded: false,
    data: null,
    error: null
  });

  await p;
  obj.update();

  verifyPropsFor(obj, DummyA, {
    loading: false,
    loaded: true,
    data: null,
    error: [{ msg: "a" }]
  });
});

test("Error in promise", async () => {
  ComponentA = getComponentWithDummyA();
  let p = Promise.reject({ message: "Hello" });
  client1.nextResult = p;
  let obj = mount(<ComponentA a={1} unused={0} />);

  verifyPropsFor(obj, DummyA, {
    loading: true,
    loaded: false,
    data: null,
    error: null
  });

  try {
    await p;
  } catch (e) {}
  obj.update();

  verifyPropsFor(obj, DummyA, {
    loading: false,
    loaded: true,
    data: null,
    error: { message: "Hello" }
  });
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
