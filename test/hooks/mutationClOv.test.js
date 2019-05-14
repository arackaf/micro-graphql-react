import { render } from "react-testing-library";
import { React, ClientMock, setDefaultClient, useMutation } from "../testSuiteInitialize";

let client1;
let client2;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const Dummy = () => null;

const getComponentA = () => {
  let currentProps = {};
  return [
    () => currentProps,
    props => {
      const mutation1 = useMutation(["A", { client: client2 }]);
      currentProps = mutation1;
      return <Dummy {...props} mutation1={mutation1} />;
    }
  ];
};

const getComponentB = () => {
  let currentProps1 = {};
  let currentProps2 = {};
  return [
    () => currentProps1,
    () => currentProps2,
    props => {
      const mutation1 = useMutation(["A", { client: client2 }]);
      const mutation2 = useMutation(["B", { client: client2 }]);

      currentProps1 = mutation1;
      currentProps2 = mutation2;

      return <Dummy {...props} mutation1={mutation1} mutation2={mutation2} />;
    }
  ];
};

test("Mutation function exists", () => {
  let [getProps, ComponentA] = getComponentA();
  render(<ComponentA />);

  expect(typeof getProps().runMutation).toBe("function");
  expect(getProps().running).toBe(false);
  expect(getProps().finished).toBe(false);
});

test("Mutation function calls", () => {
  let [getProps, ComponentA] = getComponentA();
  render(<ComponentA />);
  getProps().runMutation();

  expect(client2.mutationsRun).toBe(1);
});

test("Mutation function calls", () => {
  let [getProps1, getProps2, ComponentB] = getComponentB();
  render(<ComponentB />);

  getProps1().runMutation();
  getProps2().runMutation();

  expect(client2.mutationsRun).toBe(2);
});
