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

test("Basic query fires on mount", () => {
  let obj = mount(<ComponentA a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  expect(client1.queriesRun).toBe(1);
  expect(client1.queryCalls).toEqual([[queryA, { a: 1 }]]);
});

test("loading props passed", async () => {
  ComponentA = getComponentA(props => {
    return <DummyA {...props.query1} />;
  });
  let obj = mount(<ComponentA a={1} unused={0} />);

  let props = obj
    .childAt(0)
    .children()
    .find(DummyA)
    .props();

  expect(props).toEqual({
    loading: true,
    loaded: false,
    data: null,
    error: null
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
