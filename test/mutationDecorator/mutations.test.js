import { React, Component, mount, shallow, ClientMock, query, mutation, setDefaultClient, basicQuery } from "../testSuiteInitialize";
import { getPropsFor } from "../testUtils";

let client1;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

class Dummy extends Component {
  render() {
    return null;
  }
}

const getMutationComponent = () => {
  @mutation(`someMutation{}`)
  class C extends Component {
    render() {
      let props = this.props;
      let { running, finished, runMutation } = props;

      return <Dummy {...{ running, finished, runMutation }} />;
    }
  }

  return C;
};

test("Mutation runs once", () => {
  let Component = getMutationComponent();
  let wrapper = mount(<Component />);

  let props = getPropsFor(wrapper, Dummy);
  props.runMutation();

  expect(client1.mutationsRun).toBe(1);
});

test("Mutation runs twice", () => {
  let Component = getMutationComponent();
  let wrapper = mount(<Component />);

  let props = getPropsFor(wrapper, Dummy);
  props.runMutation();

  expect(client1.mutationsRun).toBe(1);

  wrapper.update();
  props = getPropsFor(wrapper, Dummy);
  props.runMutation();

  expect(client1.mutationsRun).toBe(2);
});
