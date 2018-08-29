import { React, Component, mount, shallow, ClientMock, query, mutation, setDefaultClient, basicQuery } from "../testSuiteInitialize";
import { getPropsFor } from "../testUtils";

class Dummy extends Component {
  render() {
    return <div />;
  }
}

const getMutationComponent = () => {
  @mutation(`someMutation{}`)
  class C extends Component {
    render() {
      return <Dummy />;
    }
  }

  return C;
};

test("Error without client", () => {
  try {
    let Component = getMutationComponent();
    let wrapper = shallow(<Component />);
    expect(1).toBe(0);
  } catch (err) {
    expect(1).toBe(1);
  }
});
