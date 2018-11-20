import { React, Component, mount, ClientMock, setDefaultClient, GraphQL, useMutation } from "../testSuiteInitialize";
import { getPropsFor, deferred, resolveDeferred } from "../testUtils";

let client1;
let ComponentA;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  ComponentA = getComponentA();
});

const Dummy = () => <div />;

const getComponentA = () => props => {
  let mutationState = useMutation(["A"]);
  return <Dummy mutation1={{ ...mutationState }} />;
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

  expect(client1.mutationsRun).toBe(1);
});

test("Mutation function calls twice", () => {
  let wrapper = mount(<ComponentA />);
  let props = getPropsFor(wrapper, Dummy);
  props.mutation1.runMutation();

  wrapper.update();
  props = getPropsFor(wrapper, Dummy);
  props.mutation1.runMutation();

  expect(client1.mutationsRun).toBe(2);
});
