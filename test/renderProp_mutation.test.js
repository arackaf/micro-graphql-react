import { React, Component, mount, ClientMock, setDefaultClient, GraphQL } from "./testSuiteInitialize";
import { getPropsFor, deferred, resolveDeferred } from "./testUtils";

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

class Dummy extends Component {
  render() {
    return null;
  }
}

const getComponentA = (render = props => <Dummy {...props} />) =>
  class extends Component {
    render() {
      return <GraphQL mutation={{ mutation1: "A" }}>{render}</GraphQL>;
    }
  };

const getComponentB = (render = props => <Dummy {...props} />) =>
  class extends Component {
    render() {
      return <GraphQL mutation={{ mutation1: "A", mutation2: "B" }}>{render}</GraphQL>;
    }
  };

test("Mutation function exists", () => {
  let obj = mount(<ComponentA />);
  let props = getPropsFor(obj, Dummy);

  expect(typeof props.mutation1.runMutation).toBe("function");
  expect(props.mutation1.running).toBe(false);
  expect(props.mutation1.finished).toBe(false);
});

test("Mutation function calls", () => {
  let obj = mount(<ComponentA />);
  let props = getPropsFor(obj, Dummy);
  props.mutation1.runMutation();

  expect(client1.mutationsRun).toBe(1);
});
