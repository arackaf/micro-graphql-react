import { render } from "react-testing-library";

import { React, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { deferred, resolveDeferred, loadingPacket, pause, dataPacket, renderPropComponentFactory } from "../testUtils";

const queryA = "A";
const queryB = "B";

let client1;
let ComponentToUse;
let getProps;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  [getProps, ComponentToUse] = getQueryAndMutationComponent();
});

const getQueryAndMutationComponent = options =>
  renderPropComponentFactory(props => ({
    query: { query1: [queryA, { a: props.a }], query2: [queryB, { b: props.b }] }
  }));

test("loading props passed", async () => {
  render(<ComponentToUse a={"a"} b={"b"} unused={0} />);

  expect(getProps().query1).toMatchObject(loadingPacket);
  expect(getProps().query2).toMatchObject(loadingPacket);
});

test("Resolve both promises", async () => {
  client1.generateResponse = query => ({ data: { tasks: [{ name: query }] } });
  render(<ComponentToUse a={"a"} b={"b"} unused={0} />);

  await pause();

  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ name: queryA }] }));
  expect(getProps().query2).toMatchObject(dataPacket({ tasks: [{ name: queryB }] }));
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

  expect(getProps().query1).toMatchObject(loadingPacket);
  expect(getProps().query2).toMatchObject(loadingPacket);

  await resolveDeferred(a1, { data: { tasks: [{ name: "a1" }] } });

  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ name: "a1" }] }));
  expect(getProps().query2).toMatchObject(loadingPacket);

  await resolveDeferred(b1, { data: { tasks: [{ name: "b1" }] } });

  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ name: "a1" }] }));
  expect(getProps().query2).toMatchObject(dataPacket({ tasks: [{ name: "b1" }] }));

  rerender(<ComponentToUse a={2} b={2} unused={0} />);

  expect(getProps().query1).toMatchObject({ ...dataPacket({ tasks: [{ name: "a1" }] }), loading: true });
  expect(getProps().query2).toMatchObject({ ...dataPacket({ tasks: [{ name: "b1" }] }), loading: true });

  await resolveDeferred(a2, { data: { tasks: [{ name: "a2" }] } });
  await resolveDeferred(b2, { data: { tasks: [{ name: "b2" }] } });

  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ name: "a2" }] }));
  expect(getProps().query2).toMatchObject(dataPacket({ tasks: [{ name: "b2" }] }));
});
