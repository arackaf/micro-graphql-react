import { React, render, cleanup, ClientMock, setDefaultClient, useQuery } from "../testSuiteInitialize";
import { hookComponentFactory, deferred, resolveDeferred, loadingPacket, dataPacket, errorPacket, rejectDeferred, pause } from "../testUtils";

let client1;
let ComponentToUse;
let getProps;

const getComponent = hookComponentFactory(["A", props => ({ a: props.a })]);

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  [getProps, ComponentToUse] = getComponent();
});

test("Error in promise", async () => {
  let p = (client1.nextResult = deferred());
  render(<ComponentToUse a={1} unused={0} />);

  expect(getProps()).toMatchObject(loadingPacket);

  await rejectDeferred(p, { message: "Hello" });
  expect(getProps()).toMatchObject(errorPacket({ message: "Hello" }));
});
