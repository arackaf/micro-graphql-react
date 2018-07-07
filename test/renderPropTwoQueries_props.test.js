import { React, Component, mount, ClientMock, setDefaultClient, GraphQL } from "./testSuiteInitialize";
import { verifyPropsFor, deferred, resolveDeferred, loadingPacket, pause, dataPacket } from "./testUtils";

const queryA = "A";
const queryB = "B";

let client1;
let ComponentToUse;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

class DummyA extends Component {
  render() {
    return <div />;
  }
}
class DummyB extends Component {
  render() {
    return <div />;
  }
}

const getComponent = () =>
  class extends Component {
    render() {
      return (
        <GraphQL query={{ query1: [queryA, { a: this.props.a }], query2: [queryB, { b: this.props.b }] }}>
          {props => {
            return (
              <div>
                <DummyA {...props.query1} />
                <DummyB {...props.query2} />
              </div>
            );
          }}
        </GraphQL>
      );
    }
  };

test("loading props passed", async () => {
  ComponentToUse = getComponent();
  let wrapper = mount(<ComponentToUse a={"a"} b={"b"} unused={0} />);

  verifyPropsFor(wrapper, DummyA, loadingPacket);
  verifyPropsFor(wrapper, DummyB, loadingPacket);
});

test("Resolve both promises", async () => {
  ComponentToUse = getComponent();

  client1.generateResponse = query => ({ data: { tasks: [{ name: query }] } });
  let wrapper = mount(<ComponentToUse a={"a"} b={"b"} unused={0} />);

  await pause(wrapper);

  verifyPropsFor(wrapper, DummyA, dataPacket({ tasks: [{ name: queryA }] }));
  verifyPropsFor(wrapper, DummyB, dataPacket({ tasks: [{ name: queryB }] }));
});

const getDeferreds = howMany => Array.from({ length: howMany }, () => deferred());

const getDataFunction = (As, Bs) => query => {
  let A = As;
  let B = Bs;

  if (query == queryA) {
    return A.pop();
  } else if (query == queryB) {
    return B.pop();
  }
};

test("Resolve both promises in turn", async () => {
  ComponentToUse = getComponent();

  let [a1, a2, b1, b2] = getDeferreds(4);
  client1.generateResponse = getDataFunction([a2, a1], [b2, b1]);

  let wrapper = mount(<ComponentToUse a={"a"} b={"b"} unused={0} />);

  verifyPropsFor(wrapper, DummyA, loadingPacket);
  verifyPropsFor(wrapper, DummyB, loadingPacket);

  await resolveDeferred(a1, { data: { tasks: [{ name: "a1" }] } }, wrapper);

  verifyPropsFor(wrapper, DummyA, dataPacket({ tasks: [{ name: "a1" }] }));
  verifyPropsFor(wrapper, DummyB, loadingPacket);

  await resolveDeferred(b1, { data: { tasks: [{ name: "b1" }] } }, wrapper);

  verifyPropsFor(wrapper, DummyA, dataPacket({ tasks: [{ name: "a1" }] }));
  verifyPropsFor(wrapper, DummyB, dataPacket({ tasks: [{ name: "b1" }] }));

  wrapper.setProps({ a: 2, b: 2 });
  wrapper.update();

  verifyPropsFor(wrapper, DummyA, { ...dataPacket({ tasks: [{ name: "a1" }] }), loading: true });
  verifyPropsFor(wrapper, DummyB, { ...dataPacket({ tasks: [{ name: "b1" }] }), loading: true });

  await resolveDeferred(a2, { data: { tasks: [{ name: "a2" }] } }, wrapper);
  await resolveDeferred(b2, { data: { tasks: [{ name: "b2" }] } }, wrapper);

  verifyPropsFor(wrapper, DummyA, dataPacket({ tasks: [{ name: "a2" }] }));
  verifyPropsFor(wrapper, DummyB, dataPacket({ tasks: [{ name: "b2" }] }));
});
