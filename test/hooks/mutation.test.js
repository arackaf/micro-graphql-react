import { render } from "react-testing-library";
import { React, ClientMock, setDefaultClient, useMutation } from "../testSuiteInitialize";

let client1;
let ComponentA;
let getProps;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  [getProps, ComponentA] = getComponentA();
});

const Dummy = () => <div />;

const getComponentA = () => {
  let currentProps = {};
  return [
    () => currentProps,
    props => {
      let mutationState = useMutation(["A"]);
      currentProps = mutationState;
      return <Dummy mutation1={{ ...mutationState }} />;
    }
  ];
};

test("Mutation function exists", () => {
  render(<ComponentA />);

  expect(typeof getProps().runMutation).toBe("function");
  expect(getProps().running).toBe(false);
  expect(getProps().finished).toBe(false);
});

test("Mutation function calls", () => {
  render(<ComponentA />);
  getProps().runMutation();

  expect(client1.mutationsRun).toBe(1);
});

test("Mutation function calls twice", () => {
  render(<ComponentA />);
  getProps().runMutation();
  getProps().runMutation();

  expect(client1.mutationsRun).toBe(2);
});
