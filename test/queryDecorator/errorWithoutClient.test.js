import { React, Component, mount, shallow, ClientMock, query, setDefaultClient, basicQuery } from "../testSuiteInitialize";
import { getPropsFor } from "../testUtils";

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

test("Render without client", () => {
  try {
    let BasicQuery = getComponent(basicQuery);
    let wrapper = shallow(<BasicQuery unused={0} />);
    expect(1).toBe(0);
  } catch (err) {
    expect(1).toBe(1);
  }
});
