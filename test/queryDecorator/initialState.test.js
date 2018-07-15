import { React, Component, shallow, mount, ClientMock, query, mutation, setDefaultClient, basicQuery } from "../testSuiteInitialize";
import { deferred, getPropsFor } from "../testUtils";

let client1;
let BasicQuery;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  BasicQuery = getComponent(basicQuery);
});

const DEFAULT_CACHE_SIZE = 10;

class Dummy extends Component {
  render() {
    return null;
  }
}

const getComponent = (...args) => {
  @query(...args)
  class C extends Component {
    render() {
      let props = this.props;
      expect(typeof props.data).toBe("object");
      expect(typeof props.error).toBe("object");
      expect(typeof props.loading).toBe("boolean");
      expect(typeof props.loaded).toBe("boolean");

      return <Dummy {...this.props} />;
    }
  }

  return C;
};

const basicQueryWithVariablesPacket = [basicQuery, props => ({ page: props.page })];

test("Everything exists when rendered", () => {
  client1.nextResult = deferred();
  let Component = getComponent();
  let wrapper = mount(<Component />);
  let props = getPropsFor(wrapper, Dummy);
});
