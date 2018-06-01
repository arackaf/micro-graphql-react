import { React, Component, mount, ClientMock, query, mutation, setDefaultClient, basicQuery, basicQueryWithVariables } from "./testSuiteInitialize";

let client1;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const DEFAULT_CACHE_SIZE = 10;

const getComponent = (...args) =>
  @query(...args)
  class extends Component {
    render = () => null;
  };

const basicQueryWithVariablesPacket = [basicQueryWithVariables, props => ({ page: props.page })];

test("shouldQueryUpdate works 1", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket, { shouldQueryUpdate: ({ props }) => props.shouldRun });
  let obj = mount(<Component page={1} unused={10} />);
  expect(client1.queriesRun).toBe(1);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: i + 2, shouldRun: false }));
  expect(client1.queriesRun).toBe(1);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: 10 - i - 1, shouldRun: false }));
  expect(client1.queriesRun).toBe(1);
});

test("shouldQueryUpdate works 2", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket, { shouldQueryUpdate: ({ props }) => props.page % 2 });
  let obj = mount(<Component page={1} unused={10} />);
  expect(client1.queriesRun).toBe(1);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(5);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: 10 - i - 1 }));
  expect(client1.queriesRun).toBe(5);
});
