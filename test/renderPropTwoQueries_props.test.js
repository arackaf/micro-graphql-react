import { React, Component, mount, ClientMock, setDefaultClient, GraphQL, verifyPropsFor } from "./testSuiteInitialize";

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
  let obj = mount(<ComponentToUse a={"a"} b={"b"} unused={0} />);

  verifyPropsFor(obj, DummyA, {
    loading: true,
    loaded: false,
    data: null,
    error: null
  });

  verifyPropsFor(obj, DummyB, {
    loading: true,
    loaded: false,
    data: null,
    error: null
  });
});
