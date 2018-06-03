import { React, Component, shallow, ClientMock, query, mutation, setDefaultClient, basicQuery, basicQueryWithVariables } from "./testSuiteInitialize";

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

const getMutationComponent = (...args) =>
  @mutation(`mutation{}`)
  @query(...args)
  class extends Component {
    render = () => null;
  };

const basicMutationPacket = [basicQueryWithVariables, props => ({ page: props.page })];

test("Default cache size", async () => {
  let Component = getMutationComponent(...basicMutationPacket);
  let obj = shallow(<Component page={1} unused={10} />).dive();

  console.log("instance", obj.props());
  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: i + 2 }));
  expect(client1.queriesRun).toBe(10);

  Array.from({ length: 9 }).forEach((x, i) => obj.setProps({ page: 10 - i - 1 }));
  expect(client1.queriesRun).toBe(10);
});
