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

test("Static query never re-fires", () => {
  let obj = mount(<BasicQuery unused={0} />);

  expect(client1.queriesRun).toBe(1);

  obj.setProps({ unused: 1 });
  expect(client1.queriesRun).toBe(1);
});
