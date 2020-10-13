import { React, render, ClientMock, setDefaultClient, Cache } from "../testSuiteInitialize";
import { deferred, dataPacket, hookComponentFactory, pause } from "../testUtils";

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

test("Default cache size", async () => {
  const { rerender } = render(<Component1 page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => rerender(<Component1 unused={2} page={i + 2} />));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => rerender(<Component1 unused={2} page={10 - i - 1} />));
  expect(client1.queriesRun).toBe(10);
});

test("Reload query", async () => {
  render(<Component1 page={1} unused={10} />);
  expect(client1.queriesRun).toBe(1);

  await pause();

  getProps1().reload();
  expect(client1.queriesRun).toBe(2);
});

test("Default cache works with reloading", async () => {
  expect(client1.queriesRun).toBe(0);
  const { rerender } = render(<Component1 page={1} unused={10} />);
  expect(client1.queriesRun).toBe(1);

  getProps1().reload();
  await pause();
  
  Array.from({ length: 9 }).forEach((x, i) => rerender(<Component1 unused={2} page={i + 2} />));
  expect(client1.queriesRun).toBe(11);
  
  getProps1().reload();
  await pause();

  Array.from({ length: 9 }).forEach((x, i) => rerender(<Component1 unused={2} page={10 - i - 1} />));
  expect(client1.queriesRun).toBe(12);
});

test("Clear cache", async () => {
  let { rerender } = render(<Component1 page={1} unused={10} />);

  let cache = client1.getCache(basicQuery);
  expect(cache.entries.length).toBe(1);

  getProps1().clearCache();
  expect(cache.entries.length).toBe(0);
});

test("Clear cache and reload", async () => {
  render(<Component1 page={1} unused={10} />);

  let cache = client1.getCache(basicQuery);
  expect(cache.entries.length).toBe(1);
  
  await pause();

  getProps1().clearCacheAndReload();

  await pause();

  expect(cache.entries.length).toBe(1);
  expect(client1.queriesRun).toBe(2);
});

test("Pick up in-progress query", async () => {
  let p = (client1.nextResult = deferred());

  let { rerender: rerender1 } = render(<Component1 page={1} unused={10} />);
  let { rerender: rerender2 } = render(<Component2 page={1} unused={10} />);

  await p.resolve({ data: { tasks: [{ id: 9 }] } });
  rerender1(<Component1 page={1} unused={10} />);
  rerender2(<Component2 page={1} unused={10} />);

  expect(getProps1()).toMatchObject(dataPacket({ tasks: [{ id: 9 }] }));
  expect(getProps2()).toMatchObject(dataPacket({ tasks: [{ id: 9 }] }));

  expect(client1.queriesRun).toBe(1);
});

test("Cache accessible by query in client", async () => {
  render(<Component1 page={1} unused={10} />);
  let cache = client1.getCache(basicQuery);
  expect(typeof cache).toBe("object");
});

test("Default cache size - verify on cache object retrieved", async () => {
  let { rerender } = render(<Component1 page={1} unused={10} />);
  let cache = client1.getCache(basicQuery);

  Array.from({ length: 9 }).forEach((x, i) => {
    rerender(<Component1 page={i + 2} />);
    expect(cache.entries.length).toBe(i + 2);
  });
  expect(cache.entries.length).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => {
    rerender(<Component1 page={10 - i - 1} />);
    expect(cache.entries.length).toBe(10);
  });
  expect(cache.entries.length).toBe(10);
});

test("Second component shares the same cache", async () => {
  let { rerender: rerender1 } = render(<Component1 page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => rerender1(<Component1 page={i + 2} unused={10} />));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => rerender1(<Component1 page={10 - i - 1} unused={10} />));
  expect(client1.queriesRun).toBe(10);

  let { rerender: rerender2 } = render(<Component2 page={1} unused={10} />);
  Array.from({ length: 9 }).forEach((x, i) => rerender2(<Component2 page={i + 2} unused={10} />));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => rerender2(<Component2 page={i + 2} unused={10} />));
  expect(client1.queriesRun).toBe(10);
});

test("Default cache size with overridden client", async () => {
  let [getProps, Component] = getComponent({ client: client2 });
  let { rerender } = render(<Component page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => render(<Component page={i + 2} unused={10} />));
  expect(client2.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => render(<Component page={10 - i - 1} unused={10} />));
  expect(client2.queriesRun).toBe(10);
});
