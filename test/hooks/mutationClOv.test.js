import { React, mount, ClientMock, setDefaultClient, useMutation } from "../testSuiteInitialize";
import { getPropsFor, deferred, resolveDeferred } from "../testUtils";

let client1;
let client2;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const Dummy = () => null;

const ComponentA = props => {
  const mutation1 = useMutation(["A", { client: client2 }]);
  return <Dummy {...props} mutation1={mutation1} />;
};
//return <GraphQL mutation={{ mutation1: ["A", { client: client2 }] }}>{render}</GraphQL>;

const ComponentB = props => {
  const mutation1 = useMutation(["A", { client: client2 }]);
  const mutation2 = useMutation(["B", { client: client2 }]);

  return <Dummy {...props} mutation1={mutation1} mutation2={mutation2} />;
};

// class extends Component {
//     render() {
//       return <GraphQL mutation={{ mutation1: ["A", { client: client2 }], mutation2: ["B", { client: client2 }] }}>{render}</GraphQL>;
//     }
//   };

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
