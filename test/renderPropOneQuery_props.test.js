import { React, Component, mount, ClientMock, setDefaultClient, GraphQL, verifyPropsFor } from "./testSuiteInitialize";

const queryA = "A";
const queryB = "B";

let client1;
let ComponentA;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  ComponentA = getComponentA();
});

class DummyA extends Component {
  render() {
    return <div className="a" />;
  }
}

const getComponentA = (render = () => null) =>
  class extends Component {
    render() {
      return <GraphQL query={{ query1: [queryA, { a: this.props.a }] }}>{render}</GraphQL>;
    }
  };

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

test("Out of order promise handled", async () => {
  ComponentA = getComponentWithDummyA();
  let p = new Promise(res => setTimeout(() => res({ data: { tasks: [{ id: -999 }] } }), 1000));
  client1.nextResult = p;
  let obj = mount(<ComponentA a={1} unused={0} />);

  client1.nextResult = new Promise(res => setTimeout(() => res({ data: { tasks: [{ id: 1 }] } }), 10));
  obj.setProps({ a: 2 });

  await p;
  obj.update();

  verifyPropsFor(obj, DummyA, {
    loading: false,
    loaded: true,
    data: { tasks: [{ id: 1 }] },
    error: null
  });
});

test("Out of order promise handled 2", async () => {
  ComponentA = getComponentWithDummyA();
  let p = new Promise(res => setTimeout(() => res({ data: { tasks: [{ id: -999 }] } }), 10));
  client1.nextResult = p;
  let obj = mount(<ComponentA a={1} unused={0} />);

  client1.nextResult = new Promise(res => setTimeout(() => res({ data: { tasks: [{ id: 1 }] } }), 1000));
  obj.setProps({ a: 2 });

  await p;
  obj.update();

  verifyPropsFor(obj, DummyA, {
    loading: true,
    loaded: false,
    data: null,
    error: null
  });
});
