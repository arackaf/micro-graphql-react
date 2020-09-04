import { React, render, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { deferred, resolveDeferred, loadingPacket, pause, dataPacket, hookComponentFactory } from "../testUtils";

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

const getComponent = hookComponentFactory([queryA, props => ({ a: props.a })], [queryB, props => ({ b: props.b })]);

test("loading props passed", async () => {
  client1.nextResult = deferred();
  render(<ComponentToUse a={"a"} b={"b"} unused={0} />);

  expect(getProps1()).toMatchObject(loadingPacket);
  expect(getProps2()).toMatchObject(loadingPacket);
});

test("Resolve both promises", async () => {
  client1.generateResponse = query => ({ data: { tasks: [{ name: query }] } });
  render(<ComponentToUse a={"a"} b={"b"} unused={0} />);

  await pause();

  expect(getProps1()).toMatchObject(dataPacket({ tasks: [{ name: queryA }] }));
  expect(getProps2()).toMatchObject(dataPacket({ tasks: [{ name: queryB }] }));
});

const getDeferreds = howMany => Array.from({ length: howMany }, () => deferred());

const getDataFunction = (As, Bs) => query => {
  let A = As;
  let B = Bs;

  if (query == queryA) {
    return A.pop();
  } else if (query == queryB) {
    return B.pop();
  }
};

test("Resolve both promises in turn", async () => {
  let [a1, a2, b1, b2] = getDeferreds(4);
  client1.generateResponse = getDataFunction([a2, a1], [b2, b1]);

  let { rerender } = render(<ComponentToUse a={"a"} b={"b"} unused={0} />);

  expect(getProps1()).toMatchObject(loadingPacket);
  expect(getProps2()).toMatchObject(loadingPacket);

  await resolveDeferred(a1, { data: { tasks: [{ name: "a1" }] } });

  expect(getProps1()).toMatchObject(dataPacket({ tasks: [{ name: "a1" }] }));
  expect(getProps2()).toMatchObject(loadingPacket);

  await resolveDeferred(b1, { data: { tasks: [{ name: "b1" }] } });

  expect(getProps1()).toMatchObject(dataPacket({ tasks: [{ name: "a1" }] }));
  expect(getProps2()).toMatchObject(dataPacket({ tasks: [{ name: "b1" }] }));

  rerender(<ComponentToUse a={2} b={2} unused={0} />);
  await pause();

  expect(getProps1()).toMatchObject({ ...dataPacket({ tasks: [{ name: "a1" }] }), loading: true });
  expect(getProps2()).toMatchObject({ ...dataPacket({ tasks: [{ name: "b1" }] }), loading: true });

  await resolveDeferred(a2, { data: { tasks: [{ name: "a2" }] } });
  await resolveDeferred(b2, { data: { tasks: [{ name: "b2" }] } });

  expect(getProps1()).toMatchObject(dataPacket({ tasks: [{ name: "a2" }] }));
  expect(getProps2()).toMatchObject(dataPacket({ tasks: [{ name: "b2" }] }));
});
