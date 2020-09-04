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

afterEach(() => {
  cleanup();
});

test("loading props passed", async () => {
  client1.nextResult = deferred();
  render(<ComponentToUse a={1} unused={0} />);
  expect(getProps()).toMatchObject(loadingPacket);
});

test("Query resolves and data updated", async () => {
  let p = (client1.nextResult = deferred());
  render(<ComponentToUse a={1} unused={0} />);

  expect(getProps()).toMatchObject(loadingPacket);

  await resolveDeferred(p, { data: { tasks: [] } });
  expect(getProps()).toMatchObject(dataPacket({ tasks: [] }));
});

test("Query resolves and errors updated", async () => {
  let p = (client1.nextResult = deferred());
  render(<ComponentToUse a={1} unused={0} />);

  expect(getProps()).toMatchObject(loadingPacket);

  await resolveDeferred(p, { errors: [{ msg: "a" }] });
  expect(getProps()).toMatchObject(errorPacket([{ msg: "a" }]));
});

test("Error in promise", async () => {
  let p = (client1.nextResult = deferred());
  render(<ComponentToUse a={1} unused={0} />);

  expect(getProps()).toMatchObject(loadingPacket);

  await rejectDeferred(p, { message: "Hello" });
  expect(getProps()).toMatchObject(errorPacket({ message: "Hello" }));
});

test("Out of order promise handled", async () => {
  let pFirst = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} />);

  let pSecond = (client1.nextResult = deferred());
  rerender(<ComponentToUse a={2} unused={0} />);

  await resolveDeferred(pSecond, { data: { tasks: [{ id: 1 }] } });
  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  await resolveDeferred(pFirst, { data: { tasks: [{ id: -999 }] } });
  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));
});

test("Out of order promise handled 2", async () => {
  let pFirst = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} />);

  let pSecond = (client1.nextResult = deferred());
  rerender(<ComponentToUse a={2} unused={0} />);

  await resolveDeferred(pFirst, { data: { tasks: [{ id: -999 }] } });
  expect(getProps()).toMatchObject(loadingPacket);

  await resolveDeferred(pSecond, { data: { tasks: [{ id: 1 }] } });
  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));
});

test("Cached data handled", async () => {
  let pData = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } });
  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  pData = client1.nextResult = deferred();
  rerender(<ComponentToUse a={2} unused={0} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 2 }] } });
  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 2 }] }));

  rerender(<ComponentToUse a={1} unused={0} />);
  await pause();
  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } });

  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));
  expect(client1.queriesRun).toBe(2);
});

test("Cached data while loading handled", async () => {
  let pData = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } });
  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  pData = client1.nextResult = deferred();
  rerender(<ComponentToUse a={2} unused={0} />);
  await pause();
  expect(getProps()).toMatchObject({ ...dataPacket({ tasks: [{ id: 1 }] }), loading: true });

  rerender(<ComponentToUse a={1} unused={0} />);
  await pause();
  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));
});

test("Promise in flight picked up - resolved - handled", async () => {
  const [getProps1, ComponentToUse1] = getComponent();
  const [getProps2, ComponentToUse2] = getComponent();

  let pData = (client1.nextResult = deferred());
  let { rerender1 } = render(<ComponentToUse1 a={1} unused={0} />);

  await pause();

  let { rerender2 } = render(<ComponentToUse2 a={1} unused={0} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } });
  expect(getProps1()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));
  expect(getProps2()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));
});

test("Promise in flight picked up - rejected - and handled", async () => {
  const [getProps1, ComponentToUse1] = getComponent();
  const [getProps2, ComponentToUse2] = getComponent();

  let pData = (client1.nextResult = deferred());
  let { rerender1 } = render(<ComponentToUse1 a={1} unused={0} />);

  await pause();

  let { rerender2 } = render(<ComponentToUse2 a={1} unused={0} />);

  await rejectDeferred(pData, { message: "Hello" });
  expect(getProps1()).toMatchObject(errorPacket({ message: "Hello" }));
  expect(getProps2()).toMatchObject(errorPacket({ message: "Hello" }));
});

test("Reload query - see new data", async () => {
  let pFirst = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} />);

  await resolveDeferred(pFirst, { data: { tasks: [{ id: 1 }] } });
  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  let pSecond = (client1.nextResult = deferred());
  getProps().reload();
  await resolveDeferred(pSecond, { data: { tasks: [{ id: 2 }] } });
  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 2 }] }));
});
