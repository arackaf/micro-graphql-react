import { React, Component, mount, ClientMock, query, setDefaultClient, basicQuery, GraphQL, basicQueryWithVariables } from "./testSuiteInitialize";

let client1;
let BasicQuery;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  BasicQuery = getComponent(basicQuery);
});

const DEFAULT_CACHE_SIZE = 10;

const getComponent = () =>
  class extends Component {
    render = () => <GraphQL query={{ query1: [basicQueryWithVariables, { a: this.props.a }] }}>{() => null}</GraphQL>;
  };

const basicQueryWithVariablesPacket = [basicQuery];

test("Basic query fires on mount", () => {
  let obj = mount(<BasicQuery a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  expect(client1.queriesRun).toBe(1);
  expect(client1.queryCalls).toEqual([[basicQueryWithVariables, { a: 1 }]]);
});

test("Basic query does not re-fire for unrelated prop change", () => {
  let obj = mount(<BasicQuery a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  obj.setProps({ unused: 1 });
  expect(client1.queriesRun).toBe(1);
  expect(client1.queryCalls).toEqual([[basicQueryWithVariables, { a: 1 }]]);
});

test("Basic query re-fires for prop change", () => {
  let obj = mount(<BasicQuery a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  obj.setProps({ a: 2 });

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[basicQueryWithVariables, { a: 1 }], [basicQueryWithVariables, { a: 2 }]]);
});

test("Basic query hits cache", () => {
  let obj = mount(<BasicQuery a={1} unused={0} />);

  expect(client1.queriesRun).toBe(1);

  obj.setProps({ a: 2 });
  obj.setProps({ a: 1 });

  expect(client1.queriesRun).toBe(2);
  expect(client1.queryCalls).toEqual([[basicQueryWithVariables, { a: 1 }], [basicQueryWithVariables, { a: 2 }]]);
});
