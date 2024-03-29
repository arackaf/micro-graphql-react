import { React, render, Component, ClientMock, setDefaultClient, Cache } from "../testSuiteInitialize";
import { deferred, resolveDeferred, hookComponentFactory } from "../testUtils";

let client1;
let client2;
const basicQuery = "A";

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint2");
  setDefaultClient(client1);
});

const getComponent = hookComponentFactory([basicQuery, props => ({ page: props.page })]);

const [getProps1, Component1] = getComponent();
const [getProps2, Component2] = getComponent();

describe("Disable caching", () => {
  test("Explicit cache with size zero", async () => {
    let noCache = new Cache(1);
    let [getProps, Component] = getComponent({ cache: noCache });
    let p = (client1.nextResult = deferred());
    render(<Component page={1} unused={10} />);
    await resolveDeferred(p, { data: { tasks: [{ id: 1 }] } });
    render(<Component page={1} unused={10} />);

    expect(client1.queriesRun).toBe(1);
  });

  test("Client with cacheSize zero", async () => {
    let noCacheClient = new ClientMock({ cacheSize: 1 });
    let [getProps, Component] = getComponent({ client: noCacheClient });
    let p = (client1.nextResult = deferred());
    render(<Component page={1} unused={10} />);
    await resolveDeferred(p, { data: { tasks: [{ id: 1 }] } });
    render(<Component page={1} unused={10} />);

    expect(noCacheClient.queriesRun).toBe(1);
  });
});
