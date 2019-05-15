import { render } from "react-testing-library";

import { React, ClientMock, setDefaultClient, Cache } from "../testSuiteInitialize";
import { deferred, dataPacket, resolveDeferred, pause, renderPropComponentFactory } from "../testUtils";

let client1;
let client2;
let ComponentToRender;
let getProps;
const basicQuery = "A";

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint2");
  setDefaultClient(client1);
  [getProps, ComponentToRender] = getComponent();
});

const getComponent = options => renderPropComponentFactory(props => ({ query: { query1: [basicQuery, { page: props.page }, options] } }));

test("Default cache size", async () => {
  let { rerender } = render(<ComponentToRender page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => rerender(<ComponentToRender page={i + 2} unused={10} />));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => rerender(<ComponentToRender page={10 - i - 1} unused={10} />));
  expect(client1.queriesRun).toBe(10);
});

test("Reload query", async () => {
  let { rerender } = render(<ComponentToRender page={1} unused={10} />);
  expect(client1.queriesRun).toBe(1);

  getProps().query1.reload();
  expect(client1.queriesRun).toBe(2);
});

test("Clear cache", async () => {
  let { rerender } = render(<ComponentToRender page={1} unused={10} />);

  let cache = client1.getCache(basicQuery);
  expect(cache.entries.length).toBe(1);

  getProps().query1.clearCache();
  expect(cache.entries.length).toBe(0);
});

test("Clear cache and reload", async () => {
  let { rerender } = render(<ComponentToRender page={1} unused={10} />);

  let cache = client1.getCache(basicQuery);
  expect(cache.entries.length).toBe(1);

  getProps().query1.clearCacheAndReload();
  expect(cache.entries.length).toBe(1);
  expect(client1.queriesRun).toBe(2);
});

test("Pick up in-progress query", async () => {
  let p = (client1.nextResult = deferred());

  let [getProps1, Component1] = getComponent();
  let [getProps2, Component2] = getComponent();

  render(<Component1 page={1} unused={10} />);
  render(<Component2 page={1} unused={10} />);

  await p.resolve({ data: { tasks: [{ id: 9 }] } });
  await pause();

  expect(getProps1().query1).toMatchObject(dataPacket({ tasks: [{ id: 9 }] }));
  expect(getProps2().query1).toMatchObject(dataPacket({ tasks: [{ id: 9 }] }));

  expect(client1.queriesRun).toBe(1);
});

test("Cache accessible by query in client", async () => {
  render(<ComponentToRender page={1} unused={10} />);
  let cache = client1.getCache(basicQuery);
  expect(typeof cache).toBe("object");
});

test("Default cache size - verify on cache object retrieved", async () => {
  let { rerender } = render(<ComponentToRender page={1} unused={10} />);
  let cache = client1.getCache(basicQuery);

  Array.from({ length: 9 }).forEach((x, i) => {
    rerender(<ComponentToRender page={i + 2} unused={10} />);
    expect(cache.entries.length).toBe(i + 2);
  });
  expect(cache.entries.length).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => {
    rerender(<ComponentToRender page={10 - i - 1} unused={10} />);
    expect(cache.entries.length).toBe(10);
  });
  expect(cache.entries.length).toBe(10);
});

test("Second component shares the same cache", async () => {
  let { rerender } = render(<ComponentToRender page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => rerender(<ComponentToRender page={i + 2} unused={10} />));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => rerender(<ComponentToRender page={10 - i - 1} unused={10} />));
  expect(client1.queriesRun).toBe(10);

  let { rerender: rerender2 } = render(<ComponentToRender page={1} unused={10} />);
  Array.from({ length: 9 }).forEach((x, i) => rerender2(<ComponentToRender page={i + 2} unused={10} />));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => rerender2(<ComponentToRender page={10 - i - 1} unused={10} />));
  expect(client1.queriesRun).toBe(10);
});

test("Override cache size", async () => {
  let cacheOverride = new Cache(2);
  let [getProps, Component] = getComponent({ cache: cacheOverride });
  let { rerender } = render(<Component page={1} unused={10} />);

  //3 is a cache ejection, cache is now 2,3
  Array.from({ length: 2 }).forEach((x, i) => rerender(<Component page={i + 2} unused={10} />));
  expect(client1.queriesRun).toBe(3);

  //call 2, cache hit, cache is now 2,3
  //call 1, cache miss
  Array.from({ length: 2 }).forEach((x, i) => rerender(<Component page={3 - i - 1} unused={10} />));
  expect(client1.queriesRun).toBe(4);

  expect(cacheOverride.entries.length).toBe(2);
});

test("Default cache size with overridden client", async () => {
  let [getProps, Component] = getComponent({ client: client2 });
  let { rerender } = render(<Component page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => rerender(<Component page={i + 2} unused={10} />));
  expect(client2.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => rerender(<Component page={10 - i - 1} unused={10} />));
  expect(client2.queriesRun).toBe(10);
});

test("Override cache size with overridden client", async () => {
  let cacheOverride = new Cache(2);
  let [getProps, Component] = getComponent({ cache: cacheOverride, client: client2 });
  let { rerender } = render(<Component page={1} unused={10} />);

  //3 is a cache ejection, cache is now 2,3
  Array.from({ length: 2 }).forEach((x, i) => rerender(<Component page={i + 2} unused={10} />));
  expect(client2.queriesRun).toBe(3);

  //call 2, cache hit, cache is now 2,3
  //call 1, cache miss
  Array.from({ length: 2 }).forEach((x, i) => rerender(<Component page={3 - i - 1} unused={10} />));
  expect(client2.queriesRun).toBe(4);
  expect(cacheOverride.entries.length).toBe(2);
});
