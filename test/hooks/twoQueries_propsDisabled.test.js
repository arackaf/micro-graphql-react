import { React, render, Component, mount, ClientMock, setDefaultClient, GraphQL, useQuery } from "../testSuiteInitialize";
import { pause, defaultPacket, hookComponentFactory } from "../testUtils";

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

const getComponent = hookComponentFactory([queryA, props => ({ a: props.a })], [queryB, props => ({ b: props.b })]).bind(
  null,
  props => ({ active: props.activeA }),
  props => ({ active: props.activeB })
);

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
