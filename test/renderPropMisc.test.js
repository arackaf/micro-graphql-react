import { React, Component, mount, ClientMock, setDefaultClient, GraphQL } from "./testSuiteInitialize";
import { verifyPropsFor, deferred, resolveDeferred, loadingPacket, pause, dataPacket } from "./testUtils";

const LOAD_TASKS = "A";
const LOAD_USERS = "B";
const UPDATE_USER = "M";

let client1;
let ComponentToUse;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

class DummyA extends Component {
  render() {
    return <div />;
  }
}
class DummyB extends Component {
  render() {
    return <div />;
  }
}

test("loading props passed initially", async () => {
  class ComponentToUse extends Component {
    render() {
      return (
        <GraphQL
          query={{ loadTasks: [LOAD_TASKS, { assignedTo: this.props.assignedTo }], loadUsers: [LOAD_USERS, { name: this.props.name }] }}
          mutation={{ updateUser: [UPDATE_USER] }}
        >
          {props => {
            expect(typeof props.loadTasks.loading).toEqual("boolean");
            expect(typeof props.loadTasks.loaded).toEqual("boolean");
            expect(typeof props.loadTasks.data).toEqual("object");
            expect(typeof props.loadTasks.error).toEqual("object");

            expect(typeof props.loadUsers.loading).toEqual("boolean");
            expect(typeof props.loadUsers.loaded).toEqual("boolean");
            expect(typeof props.loadUsers.data).toEqual("object");
            expect(typeof props.loadUsers.error).toEqual("object");

            expect(typeof props.updateUser.running).toBe("boolean");
            expect(typeof props.updateUser.finished).toBe("boolean");
            expect(typeof props.updateUser.runMutation).toBe("function");
            return null;
          }}
        </GraphQL>
      );
    }
  }

  client1.nextResult = { data: {} };
  let wrapper = mount(<ComponentToUse />);
  wrapper.setProps({ x: 12 });
  wrapper.setProps({ x: 13 });
  wrapper.update();
  wrapper.setProps({ x: 13 });
  await pause(wrapper);
});
