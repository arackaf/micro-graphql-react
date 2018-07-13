import { React, Component, mount, ClientMock, GraphQL, setDefaultClient, basicQuery, QueryCache } from "../testSuiteInitialize";
import { getPropsFor, verifyPropsFor, deferred, dataPacket } from "../testUtils";

let client1;
let client2;
let client3;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint2");
  client3 = new ClientMock("endpoint3");
  setDefaultClient(client1);
});

class Dummy extends Component {
  render() {
    return <div />;
  }
}

const getComponent = options =>
  class extends Component {
    render() {
      return <GraphQL query={{ query1: [basicQuery, { page: this.props.page }, options] }}>{props => <Dummy {...props.query1} />}</GraphQL>;
    }
  };

test("Default cache size", async () => {
  let Component = getComponent();
  let wrapper = mount(<Component page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => wrapper.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => wrapper.setProps({ page: 10 - i - 1 }));
  expect(client1.queriesRun).toBe(10);
});

test("Reload query", async () => {
  let Component = getComponent();
  let wrapper = mount(<Component page={1} unused={10} />);
  expect(client1.queriesRun).toBe(1);

  let props = getPropsFor(wrapper, Dummy);
  props.reload();
  expect(client1.queriesRun).toBe(2);
});

test("Clear cache", async () => {
  let Component = getComponent();
  let wrapper = mount(<Component page={1} unused={10} />);

  let cache = client1.getCache(basicQuery);
  expect(cache.entries.length).toBe(1);

  let props = getPropsFor(wrapper, Dummy);
  props.clearCache();
  expect(cache.entries.length).toBe(0);
});

test("Clear cache and reload", async () => {
  let Component = getComponent();
  let wrapper = mount(<Component page={1} unused={10} />);

  let cache = client1.getCache(basicQuery);
  expect(cache.entries.length).toBe(1);

  let props = getPropsFor(wrapper, Dummy);
  props.clearCacheAndReload();
  expect(cache.entries.length).toBe(1);
  expect(client1.queriesRun).toBe(2);
});

test("Pick up in-progress query", async () => {
  let Component = getComponent();
  let p = (client1.nextResult = deferred());

  let wrapper1 = mount(<Component page={1} unused={10} />);
  let wrapper2 = mount(<Component page={1} unused={10} />);

  await p.resolve({ data: { tasks: [{ id: 9 }] } });
  wrapper1.update();
  wrapper2.update();

  verifyPropsFor(wrapper1, Dummy, dataPacket({ tasks: [{ id: 9 }] }));
  verifyPropsFor(wrapper2, Dummy, dataPacket({ tasks: [{ id: 9 }] }));

  expect(client1.queriesRun).toBe(1);
});

test("Cache accessible by query in client", async () => {
  let Component = getComponent();
  mount(<Component page={1} unused={10} />);
  let cache = client1.getCache(basicQuery);
  expect(typeof cache).toBe("object");
});

test("Default cache size - verify on cache object retrieved", async () => {
  let Component = getComponent();
  let wrapper = mount(<Component page={1} unused={10} />);
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
  let Component = getComponent();
  let wrapper = mount(<Component page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => wrapper.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => wrapper.setProps({ page: 10 - i - 1 }));
  expect(client1.queriesRun).toBe(10);

  let wrapper2 = mount(<Component page={1} unused={10} />);
  Array.from({ length: 9 }).forEach((x, i) => wrapper2.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => wrapper2.setProps({ page: 10 - i - 1 }));
  expect(client1.queriesRun).toBe(10);
});

test("Override cache size", async () => {
  let cacheOverride = new QueryCache(2);
  let Component = getComponent({ cache: cacheOverride });
  let wrapper = mount(<Component page={1} unused={10} />);

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
  let Component = getComponent({ client: client2 });
  let wrapper = mount(<Component page={1} unused={10} />);

  Array.from({ length: 9 }).forEach((x, i) => wrapper.setProps({ page: i + 2 }));
  expect(client2.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => wrapper.setProps({ page: 10 - i - 1 }));
  expect(client2.queriesRun).toBe(10);
});

test("Override cache size with overridden client", async () => {
  let cacheOverride = new QueryCache(2);
  let Component = getComponent({ cache: cacheOverride, client: client2 });
  let wrapper = mount(<Component page={1} unused={10} />);

  //3 is a cache ejection, cache is now 2,3
  Array.from({ length: 2 }).forEach((x, i) => wrapper.setProps({ page: i + 2 }));
  expect(client2.queriesRun).toBe(3);

  //call 2, cache hit, cache is now 2,3
  //call 1, cache miss
  Array.from({ length: 2 }).forEach((x, i) => wrapper.setProps({ page: 3 - i - 1 }));
  expect(client2.queriesRun).toBe(4);
  expect(cacheOverride.entries.length).toBe(2);
});
