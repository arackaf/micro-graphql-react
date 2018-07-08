import { React, Component, shallow, ClientMock, query, mutation, setDefaultClient, basicQuery } from "../testSuiteInitialize";

let client1;
let client2;
let client3;
let BasicQuery;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint2");
  client3 = new ClientMock("endpoint3");
  setDefaultClient(client1);
  BasicQuery = getComponent(basicQuery);
});

const DEFAULT_CACHE_SIZE = 10;

const getComponent = (...args) =>
  @query(...args)
  class extends Component {
    render = () => null;
  };

const basicQueryWithVariablesPacket = [basicQuery, props => ({ page: props.page })];

test("Static query never re-fires", () => {
  let wrapper = shallow(<BasicQuery unused={0} />);

  expect(client1.queriesRun).toBe(1);

  wrapper.setProps({ unused: 1 });
  expect(client1.queriesRun).toBe(1);
});

test("Query with variables re-fires when props change", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket);
  let wrapper = shallow(<Component page={1} />);

  expect(client1.queriesRun).toBe(1);
  wrapper.setProps({ page: 2 });
  expect(client1.queriesRun).toBe(2);
});

test("Query with variables does not re-fire when other props change", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket);
  let wrapper = shallow(<Component page={1} unused={10} />);

  expect(client1.queriesRun).toBe(1);
  wrapper.setProps({ unused: 2 });
  expect(client1.queriesRun).toBe(1);
});