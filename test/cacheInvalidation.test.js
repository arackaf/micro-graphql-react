import { React, Component, shallow, ClientMock, query, mutation, setDefaultClient, basicQuery } from "./testSuiteInitialize";

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
  let obj = shallow(<Component page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: 10 - i - 1 }));
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
  let obj = shallow(<Component page={1} unused={10} />);
  let cache = client1.getCache(basicQuery);

  Array.from({ length: 9 }).forEach((x, i) => {
    obj.setProps({ page: i + 2 });
    expect(cache.entries.length).toBe(i + 2);
  });
  expect(cache.entries.length).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => {
    obj.setProps({ page: 10 - i - 1 });
    expect(cache.entries.length).toBe(10);
  });
  expect(cache.entries.length).toBe(10);
});

//TODO: delete me
import parse from "url-parse";
test("TEMP", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket);
  let obj = shallow(<Component page={1} unused={10} />);
  let cache = client1.getCache(basicQuery);

  Array.from({ length: 9 }).forEach((x, i) => {
    obj.setProps({ page: i + 2 });
    cache.entries.forEach(([key, results]) => {
      let parsed = parse(key, true);
      //console.log(parsed.query.query);
      let variables = JSON.parse(parsed.query.variables);
      //console.log("variables:", variables, variables.page);
    });
  });
});

test("Second component shares the same cache", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket);
  let obj = shallow(<Component page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: 10 - i - 1 }));
  expect(client1.queriesRun).toBe(10);

  let obj2 = shallow(<Component page={1} unused={10} />);
  Array.from({ length: 9 }).forEach((x, i) => obj2.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => obj2.setProps({ page: 10 - i - 1 }));
  expect(client1.queriesRun).toBe(10);
});

// test("Override cache size", async () => {
//   let Component = getComponent(...basicQueryWithVariablesPacket, { cacheSize: 2 });
//   let obj = shallow(<Component page={1} unused={10} />);

//   //3 is a cache ejection, cache is now 2,3
//   Array.from({ length: 2 }).forEach((x, i) => obj.setProps({ page: i + 2 }));
//   expect(client1.queriesRun).toBe(3);

//   //call 2, cache hit, cache is now 2,3
//   //call 1, cache miss
//   Array.from({ length: 2 }).forEach((x, i) => obj.setProps({ page: 3 - i - 1 }));
//   expect(client1.queriesRun).toBe(4);
// });

test("Default cache size with overridden client", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket, { client: client2 });
  let obj = shallow(<Component page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: i + 2 }));
  expect(client2.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: 10 - i - 1 }));
  expect(client2.queriesRun).toBe(10);
});

// test("Override cache size with overridden client", async () => {
//   let Component = getComponent(...basicQueryWithVariablesPacket, { cacheSize: 2, client: client2 });
//   let obj = shallow(<Component page={1} unused={10} />);

//   //3 is a cache ejection, cache is now 2,3
//   Array.from({ length: 2 }).forEach((x, i) => obj.setProps({ page: i + 2 }));
//   expect(client2.queriesRun).toBe(3);

//   //call 2, cache hit, cache is now 2,3
//   //call 1, cache miss
//   Array.from({ length: 2 }).forEach((x, i) => obj.setProps({ page: 3 - i - 1 }));
//   expect(client2.queriesRun).toBe(4);
// });
