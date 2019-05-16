import { React, render, ClientMock, setDefaultClient } from "../testSuiteInitialize";
import { hookComponentFactory, deferred, resolveDeferred, loadingPacket, defaultPacket, dataPacket, errorPacket, pause } from "../testUtils";

let client1;
let ComponentToUse;
let getProps;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  [getProps, ComponentToUse] = getComponent();
});

const getComponent = hookComponentFactory(["A", props => ({ a: props.a })]).bind(null, props => ({ active: props.active }));

test("loading props passed", async () => {
  render(<ComponentToUse a={1} unused={0} active={false} />);
  expect(getProps()).toMatchObject(defaultPacket);
});

test("Query resolves and data updated", async () => {
  let { rerender } = render(<ComponentToUse a={1} unused={0} />);

  expect(getProps()).toMatchObject(defaultPacket);

  let p = (client1.nextResult = deferred());
  rerender(<ComponentToUse a={1} unused={0} active={true} />);
  await pause();

  expect(getProps()).toMatchObject(loadingPacket);

  await resolveDeferred(p, { data: { tasks: [] } });
  expect(getProps()).toMatchObject(dataPacket({ tasks: [] }));
});

test("Query resolves and errors updated", async () => {
  let p = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} active={false} />);

  expect(getProps()).toMatchObject(defaultPacket);

  rerender(<ComponentToUse a={1} unused={0} active={true} />);
  await pause();
  expect(getProps()).toMatchObject(loadingPacket);

  await resolveDeferred(p, { errors: [{ msg: "a" }] });
  expect(getProps()).toMatchObject(errorPacket([{ msg: "a" }]));
});

test("Cached data handled", async () => {
  let pData = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} active={true} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } });
  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  pData = client1.nextResult = deferred();
  rerender(<ComponentToUse a={2} unused={0} active={false} />);
  await pause();

  await resolveDeferred(pData, { data: { tasks: [{ id: 2 }] } });
  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  rerender(<ComponentToUse a={1} unused={0} active={false} />);
  await pause();
  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } });
  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  expect(client1.queriesRun).toBe(1);
});

test("Cached data while loading handled", async () => {
  let pData = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} active={true} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } });
  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  pData = client1.nextResult = deferred();
  rerender(<ComponentToUse a={2} unused={0} active={false} />);
  await pause();

  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  rerender(<ComponentToUse a={1} unused={0} active={false} />);
  await pause();

  expect(getProps()).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));
});
