import { React, render, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { deferred, resolveDeferred, loadingPacket, dataPacket, errorPacket, rejectDeferred, pause, renderPropComponentFactory } from "../testUtils";

const queryA = "A";
let ComponentToUse;
let getProps;

let client1;

const getQueryAndMutationComponent = options => renderPropComponentFactory(props => ({ query: { query1: ["A", { a: props.a }] } }));

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  [getProps, ComponentToUse] = getQueryAndMutationComponent();
});

test("loading props passed", async () => {
  let { rerender } = render(<ComponentToUse a={1} unused={0} />);

  expect(getProps().query1).toMatchObject(loadingPacket);
  expect(getProps().query1).toMatchObject(loadingPacket);
});

test("Query resolves and data updated", async () => {
  let p = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} />);

  expect(getProps().query1).toMatchObject(loadingPacket);

  await resolveDeferred(p, { data: { tasks: [] } });

  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [] }));
});

test("Query resolves and errors updated", async () => {
  let p = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} />);

  expect(getProps().query1).toMatchObject(loadingPacket);

  await resolveDeferred(p, { errors: [{ msg: "a" }] });
  expect(getProps().query1).toMatchObject(errorPacket([{ msg: "a" }]));
});

test("Error in promise", async () => {
  let p = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} />);

  expect(getProps().query1).toMatchObject(loadingPacket);

  await rejectDeferred(p, { message: "Hello" });
  await pause();
  expect(getProps().query1).toMatchObject(errorPacket({ message: "Hello" }));
});

test("Out of order promise handled", async () => {
  let pFirst = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} />);

  let pSecond = (client1.nextResult = deferred());
  rerender(<ComponentToUse a={2} unused={0} />);

  await resolveDeferred(pSecond, { data: { tasks: [{ id: 1 }] } });
  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  await resolveDeferred(pFirst, { data: { tasks: [{ id: -999 }] } });
  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));
});

test("Out of order promise handled 2", async () => {
  let pFirst = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} />);

  let pSecond = (client1.nextResult = deferred());
  rerender(<ComponentToUse a={2} unused={0} />);

  await resolveDeferred(pFirst, { data: { tasks: [{ id: -999 }] } });
  expect(getProps().query1).toMatchObject(loadingPacket);

  await resolveDeferred(pSecond, { data: { tasks: [{ id: 1 }] } });
  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));
});

test("Cached data handled", async () => {
  let pData = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } });
  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  pData = client1.nextResult = deferred();
  rerender(<ComponentToUse a={2} unused={0} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 2 }] } });
  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ id: 2 }] }));

  rerender(<ComponentToUse a={1} unused={0} />);
  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } });
  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  expect(client1.queriesRun).toBe(2);
});

test("Cached data while loading handled", async () => {
  let pData = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } });
  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  pData = client1.nextResult = deferred();
  rerender(<ComponentToUse a={2} unused={0} />);

  expect(getProps().query1).toMatchObject({ ...dataPacket({ tasks: [{ id: 1 }] }), loading: true });

  await pause();
  rerender(<ComponentToUse a={1} unused={0} />);
  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));
});
