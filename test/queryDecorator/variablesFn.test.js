import { React, Component, mount, shallow, ClientMock, query, setDefaultClient, basicQuery } from "../testSuiteInitialize";
import { getPropsFor } from "../testUtils";

let client1;
let BasicQuery;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  BasicQuery = getComponent(basicQuery);
});

class Dummy extends Component {
  render() {
    return null;
  }
}

const getComponent = (...args) => {
  @query(...args)
  class C extends Component {
    render() {
      return <Dummy {...this.props} />;
    }
  }

  return C;
};

test("Query with variables does not re-fire when other props change", async () => {
  let Component = getComponent(basicQuery, {});
  let wrapper = shallow(<Component page={1} unused={10} />);

  expect(client1.queriesRun).toBe(1);
  wrapper.setProps({ unused: 2 });
  expect(client1.queriesRun).toBe(1);

  expect(client1.queryCalls[0][1]).toBeNull();
});

test("Query with variables does not re-fire when other props change", async () => {
  let Component = getComponent(basicQuery);
  let wrapper = shallow(<Component page={1} unused={10} />);

  expect(client1.queriesRun).toBe(1);
  expect(client1.queryCalls[0][1]).toBeNull();
  wrapper.setProps({ unused: 2 });
  expect(client1.queriesRun).toBe(1);
  expect(client1.queryCalls[0][1]).toBeNull();
});
