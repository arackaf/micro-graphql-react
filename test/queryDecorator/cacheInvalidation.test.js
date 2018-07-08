import { React, Component, shallow, ClientMock, query, mutation, setDefaultClient, basicQuery, QueryCache } from "../testSuiteInitialize";

let client1;
let client2;
let client3;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint2");
  client3 = new ClientMock("endpoint3");
  setDefaultClient(client1);
});

const DEFAULT_CACHE_SIZE = 10;

const getComponent = (...args) =>
  @query(...args)
  class extends Component {
    render = () => null;
  };

const basicQueryWithVariablesPacket = [basicQuery, props => ({ page: props.page })];

test("Default cache size", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket);
  let wrapper = shallow(<Component page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => wrapper.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => wrapper.setProps({ page: 10 - i - 1 }));
  expect(client1.queriesRun).toBe(10);
});

test("Cache accessible by query in client", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket);
  shallow(<Component page={1} unused={10} />);
  let cache = client1.getCache(basicQuery);
  expect(typeof cache).toBe("object");
});

test("Default cache size - verify on cache object retrieved", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket);
  let wrapper = shallow(<Component page={1} unused={10} />);
  let cache = client1.getCache(basicQuery);

  Array.from({ length: 9 }).forEach((x, i) => {
    wrapper.setProps({ page: i + 2 });
    expect(cache.entries.length).toBe(i + 2);
  });
  expect(cache.entries.length).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => {
    wrapper.setProps({ page: 10 - i - 1 });
    expect(cache.entries.length).toBe(10);
  });
  expect(cache.entries.length).toBe(10);
});

test("Second component shares the same cache", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket);
  let wrapper = shallow(<Component page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => wrapper.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => wrapper.setProps({ page: 10 - i - 1 }));
  expect(client1.queriesRun).toBe(10);

  let wrapper2 = shallow(<Component page={1} unused={10} />);
  Array.from({ length: 9 }).forEach((x, i) => wrapper2.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => wrapper2.setProps({ page: 10 - i - 1 }));
  expect(client1.queriesRun).toBe(10);
});

test("Override cache size", async () => {
  let cacheOverride = new QueryCache(2);
  let Component = getComponent(...basicQueryWithVariablesPacket, { cache: cacheOverride });
  let wrapper = shallow(<Component page={1} unused={10} />);

  //3 is a cache ejection, cache is now 2,3
  Array.from({ length: 2 }).forEach((x, i) => wrapper.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(3);

  //call 2, cache hit, cache is now 2,3
  //call 1, cache miss
  Array.from({ length: 2 }).forEach((x, i) => wrapper.setProps({ page: 3 - i - 1 }));
  expect(client1.queriesRun).toBe(4);

  expect(cacheOverride.entries.length).toBe(2);
});

test("Default cache size with overridden client", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket, { client: client2 });
  let wrapper = shallow(<Component page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => wrapper.setProps({ page: i + 2 }));
  expect(client2.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => wrapper.setProps({ page: 10 - i - 1 }));
  expect(client2.queriesRun).toBe(10);
});

test("Override cache size with overridden client", async () => {
  let cacheOverride = new QueryCache(2);
  let Component = getComponent(...basicQueryWithVariablesPacket, { cache: cacheOverride, client: client2 });
  let wrapper = shallow(<Component page={1} unused={10} />);

  //3 is a cache ejection, cache is now 2,3
  Array.from({ length: 2 }).forEach((x, i) => wrapper.setProps({ page: i + 2 }));
  expect(client2.queriesRun).toBe(3);

  //call 2, cache hit, cache is now 2,3
  //call 1, cache miss
  Array.from({ length: 2 }).forEach((x, i) => wrapper.setProps({ page: 3 - i - 1 }));
  expect(client2.queriesRun).toBe(4);
  expect(cacheOverride.entries.length).toBe(2);
});
