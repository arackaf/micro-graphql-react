import { React, Component, mount, ClientMock, query, mutation, setDefaultClient, basicQuery, basicQueryWithVariables } from "./testSuiteInitialize";

const client1 = new ClientMock("endpoint1");
const client2 = new ClientMock("endpoint2");
const client3 = new ClientMock("endpoint3");

setDefaultClient(client1);

beforeEach(() => {
  client1.reset();
  client2.reset();
  client3.reset();
});

const DEFAULT_CACHE_SIZE = 10;

const getComponent = (...args) =>
  @query(...args)
  class extends Component {
    render = () => null;
  };

const basicQueryWithVariablesPacket = [basicQueryWithVariables, props => ({ page: props.page })];

test("Default cache size", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket);
  let obj = mount(<Component page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: 10 - i - 1 }));
  expect(client1.queriesRun).toBe(10);
});

test("Second component shares the same cache", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket);
  let obj = mount(<Component page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: 10 - i - 1 }));
  expect(client1.queriesRun).toBe(10);

  let obj2 = mount(<Component page={1} unused={10} />);
  Array.from({ length: 9 }).forEach((x, i) => obj2.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => obj2.setProps({ page: 10 - i - 1 }));
  expect(client1.queriesRun).toBe(10);
});

test("Override cache size", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket, { cacheSize: 2 });
  let obj = mount(<Component page={1} unused={10} />);

  //3 is a cache ejection, cache is now 2,3
  Array.from({ length: 2 }).forEach((x, i) => obj.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(3);

  //call 2, cache hit, cache is now 2,3
  //call 1, cache miss
  Array.from({ length: 2 }).forEach((x, i) => obj.setProps({ page: 3 - i - 1 }));
  expect(client1.queriesRun).toBe(4);
});

test("Default cache size with overridden client", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket, { client: client2 });
  let obj = mount(<Component page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: i + 2 }));
  expect(client2.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: 10 - i - 1 }));
  expect(client2.queriesRun).toBe(10);
});

test("Override cache size with overridden client", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket, { cacheSize: 2, client: client2 });
  let obj = mount(<Component page={1} unused={10} />);

  //3 is a cache ejection, cache is now 2,3
  Array.from({ length: 2 }).forEach((x, i) => obj.setProps({ page: i + 2 }));
  expect(client2.queriesRun).toBe(3);

  //call 2, cache hit, cache is now 2,3
  //call 1, cache miss
  Array.from({ length: 2 }).forEach((x, i) => obj.setProps({ page: 3 - i - 1 }));
  expect(client2.queriesRun).toBe(4);
});
