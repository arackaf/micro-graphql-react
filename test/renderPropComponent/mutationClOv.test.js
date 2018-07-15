import { React, Component, mount, ClientMock, setDefaultClient, GraphQL } from "../testSuiteInitialize";
import { getPropsFor, deferred, resolveDeferred } from "../testUtils";

const queryA = "A";
const queryB = "B";

let client1;
let client2;
let ComponentA;
let ComponentB;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint1");
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
      return <GraphQL mutation={{ mutation1: ["A", { client: client2 }] }}>{render}</GraphQL>;
    }
  };

const getComponentB = (render = props => <Dummy {...props} />) =>
  class extends Component {
    render() {
      return <GraphQL mutation={{ mutation1: ["A", { client: client2 }], mutation2: ["B", { client: client2 }] }}>{render}</GraphQL>;
    }
  };

test("Mutation function exists", () => {
  let wrapper = mount(<ComponentA />);
  let props = getPropsFor(wrapper, Dummy);

  expect(typeof props.mutation1.runMutation).toBe("function");
  expect(props.mutation1.running).toBe(false);
  expect(props.mutation1.finished).toBe(false);
});

test("Mutation function calls", () => {
  let wrapper = mount(<ComponentA />);
  let props = getPropsFor(wrapper, Dummy);
  props.mutation1.runMutation();

  expect(client2.mutationsRun).toBe(1);
});

test("Mutation function calls", () => {
  let wrapper = mount(<ComponentB />);
  let props = getPropsFor(wrapper, Dummy);
  props.mutation1.runMutation();
  props.mutation2.runMutation();

  expect(client2.mutationsRun).toBe(2);
});
