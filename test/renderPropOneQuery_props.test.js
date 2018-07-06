import { React, Component, mount, ClientMock, setDefaultClient, GraphQL, verifyPropsFor, deferred, resolveDeferred } from "./testSuiteInitialize";

const queryA = "A";
const queryB = "B";

let client1;
let ComponentToUse;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

class Dummy extends Component {
  render() {
    return <div />;
  }
}

const getComponent = () =>
  class extends Component {
    render() {
      return <GraphQL query={{ query1: [queryA, { a: this.props.a }] }}>{props => <Dummy {...props.query1} />}</GraphQL>;
    }
  };

test("loading props passed", async () => {
  ComponentToUse = getComponent();
  let obj = mount(<ComponentToUse a={1} unused={0} />);

  verifyPropsFor(obj, Dummy, {
    loading: true,
    loaded: false,
    data: null,
    error: null
  });
});

test("Query resolves and data updated", async () => {
  ComponentToUse = getComponent();
  let p = Promise.resolve({ data: { tasks: [] } });
  client1.nextResult = p;
  let obj = mount(<ComponentToUse a={1} unused={0} />);

  verifyPropsFor(obj, Dummy, {
    loading: true,
    loaded: false,
    data: null,
    error: null
  });

  await p;
  obj.update();

  verifyPropsFor(obj, Dummy, {
    loading: false,
    loaded: true,
    data: { tasks: [] },
    error: null
  });
});

test("Query resolves and errors updated", async () => {
  ComponentToUse = getComponent();
  let p = Promise.resolve({ errors: [{ msg: "a" }] });
  client1.nextResult = p;
  let obj = mount(<ComponentToUse a={1} unused={0} />);

  verifyPropsFor(obj, Dummy, {
    loading: true,
    loaded: false,
    data: null,
    error: null
  });

  await p;
  obj.update();

  verifyPropsFor(obj, Dummy, {
    loading: false,
    loaded: true,
    data: null,
    error: [{ msg: "a" }]
  });
});

test("Error in promise", async () => {
  ComponentToUse = getComponent();
  let p = Promise.reject({ message: "Hello" });
  client1.nextResult = p;
  let obj = mount(<ComponentToUse a={1} unused={0} />);

  verifyPropsFor(obj, Dummy, {
    loading: true,
    loaded: false,
    data: null,
    error: null
  });

  try {
    await p;
  } catch (e) {}
  obj.update();

  verifyPropsFor(obj, Dummy, {
    loading: false,
    loaded: true,
    data: null,
    error: { message: "Hello" }
  });
});

test("Out of order promise handled", async () => {
  ComponentToUse = getComponent();
  let pFirst = (client1.nextResult = deferred());
  let obj = mount(<ComponentToUse a={1} unused={0} />);

  let pSecond = (client1.nextResult = deferred());
  obj.setProps({ a: 2 });

  await resolveDeferred(pSecond, { data: { tasks: [{ id: 1 }] } }, obj);
  verifyPropsFor(obj, Dummy, {
    loading: false,
    loaded: true,
    data: { tasks: [{ id: 1 }] },
    error: null
  });

  await resolveDeferred(pFirst, { data: { tasks: [{ id: -999 }] } }, obj);
  verifyPropsFor(obj, Dummy, {
    loading: false,
    loaded: true,
    data: { tasks: [{ id: 1 }] },
    error: null
  });
});

test("Out of order promise handled 2", async () => {
  ComponentToUse = getComponent();
  let p = new Promise(res => setTimeout(() => res({ data: { tasks: [{ id: -999 }] } }), 10));
  client1.nextResult = p;
  let obj = mount(<ComponentToUse a={1} unused={0} />);

  client1.nextResult = new Promise(res => setTimeout(() => res({ data: { tasks: [{ id: 1 }] } }), 1000));
  obj.setProps({ a: 2 });

  await p;
  obj.update();

  verifyPropsFor(obj, Dummy, {
    loading: true,
    loaded: false,
    data: null,
    error: null
  });
});
