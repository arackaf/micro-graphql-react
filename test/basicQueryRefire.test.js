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

const BasicQuery = getComponent(basicQuery);

const basicQueryWithVariablesPacket = [basicQueryWithVariables, props => ({ page: props.page })];

test("Static query never re-fires", () => {
  let obj = mount(<BasicQuery unused={0} />);

  expect(client1.queriesRun).toBe(1);

  obj.setProps({ unused: 1 });
  expect(client1.queriesRun).toBe(1);
});

test("Query with variables re-fires when props change", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket);
  let obj = mount(<Component page={1} />);

  expect(client1.queriesRun).toBe(1);
  obj.setProps({ page: 2 });
  expect(client1.queriesRun).toBe(2);
});

test("Query with variables does not re-fire when other props change", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket);
  let obj = mount(<Component page={1} unused={10} />);

  expect(client1.queriesRun).toBe(1);
  obj.setProps({ unused: 2 });
  expect(client1.queriesRun).toBe(1);
});
