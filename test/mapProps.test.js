import { React, Component, shallow, ClientMock, query, mutation, setDefaultClient, basicQuery, basicQueryWithVariables } from "./testSuiteInitialize";

let client1;
let BasicQuery;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  BasicQuery = getComponent(basicQuery);
});

const DEFAULT_CACHE_SIZE = 10;

const getComponent = (...args) =>
  @query(...args)
  class extends Component {
    render = () => null;
  };

const basicQueryWithVariablesPacket = [basicQueryWithVariables, props => ({ page: props.page })];

test("Map props 1", () => {
  let Component = getComponent(...basicQueryWithVariablesPacket, {
    mapProps: ({ loading, loaded, data, error }) => ({ loadingX: loading, loadedX: loaded, dataX: data, errorX: error })
  });
  let obj = shallow(<Component />);

  expect(obj.props()).toMatchObject({
    loadingX: true,
    loadedX: false,
    dataX: null,
    errorX: null
  });
});

test("Map props 2", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket, {
    mapProps: ({ loading, loaded, data, error }) => ({ loadingX: loading, loadedX: loaded, dataX: data, errorX: error })
  });
  let results = { data: { allBooks: [{ title: "Hello" }] } };
  client1.nextResult = new Promise(res => res(results));

  let obj = shallow(<Component />);
  expect(obj.props()).toMatchObject({
    loadingX: true,
    loadedX: false,
    dataX: null,
    errorX: null
  });

  await client1.nextResult;

  obj.update();
  expect(obj.props()).toMatchObject({
    loadingX: false,
    loadedX: true,
    dataX: results.data,
    errorX: null
  });
});

test("Map props 3", async () => {
  let Component = getComponent(...basicQueryWithVariablesPacket, {
    mapProps: ({ loading, loaded, data, error }) => ({ packet: { loading, loaded, data, error } })
  });
  let results = { data: { allBooks: [{ title: "Hello" }] } };
  client1.nextResult = new Promise(res => res(results));

  let obj = shallow(<Component />);
  expect(obj.props().packet).toMatchObject({
    loading: true,
    loaded: false,
    data: null,
    error: null
  });

  await client1.nextResult;

  obj.update();
  expect(obj.props().packet).toMatchObject({
    loading: false,
    loaded: true,
    data: results.data,
    error: null
  });
});
