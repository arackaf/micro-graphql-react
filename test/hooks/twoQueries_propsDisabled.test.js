import { render } from "react-testing-library";
import { React, Component, mount, ClientMock, setDefaultClient, GraphQL, useQuery } from "../testSuiteInitialize";
import { verifyPropsFor, deferred, resolveDeferred, loadingPacket, pause, dataPacket, defaultPacket } from "../testUtils";
import { buildQuery } from "../../src/util";

const queryA = "A";
const queryB = "B";

let client1;
let ComponentToUse;
let getProps1;
let getProps2;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  [getProps1, getProps2, ComponentToUse] = getComponent();
});

const getComponent = () => {
  let currentProps1 = {};
  let currentProps2 = {};
  return [
    () => currentProps1,
    () => currentProps2,
    props => {
      let query1Props = useQuery(buildQuery(queryA, { a: props.a }, { active: props.activeA }));
      let query2Props = useQuery(buildQuery(queryB, { b: props.b }, { active: props.activeB }));

      currentProps1 = query1Props;
      currentProps2 = query2Props;
      return null;
    }
  ];
};

test("loading props passed", async () => {
  render(<ComponentToUse a={"a"} b={"b"} unused={0} activeA={false} activeB={false} />);

  expect(getProps1()).toMatchObject(defaultPacket);
  expect(getProps2()).toMatchObject(defaultPacket);
});

test("Resolve both promises", async () => {
  client1.generateResponse = query => ({ data: { tasks: [{ name: query }] } });
  render(<ComponentToUse a={"a"} b={"b"} unused={0} activeA={false} activeB={false} />);

  expect(getProps1()).toMatchObject(defaultPacket);
  expect(getProps2()).toMatchObject(defaultPacket);

  await pause();

  expect(getProps1()).toMatchObject(defaultPacket);
  expect(getProps2()).toMatchObject(defaultPacket);
});
