import { React, Component, mount, ClientMock, setDefaultClient, useQuery, useMutation } from "../testSuiteInitialize";
import { verifyPropsFor, deferred, resolveDeferred, loadingPacket, pause, dataPacket } from "../testUtils";

const LOAD_TASKS = "A";
const LOAD_USERS = "B";
const UPDATE_USER = "M";

let client1;
let ComponentToUse;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const DummyA = () => <div />;
const DummyB = () => <div />;

test("loading props passed initially", async () => {
  const ComponentToUse = props => {
    const loadTasks = useQuery([LOAD_TASKS, { assignedTo: props.assignedTo }]);
    const loadUsers = useQuery([LOAD_USERS, { name: props.name }]);
    const updateUser = useMutation([UPDATE_USER]);

    expect(typeof loadTasks.loading).toEqual("boolean");
    expect(typeof loadTasks.loaded).toEqual("boolean");
    expect(typeof loadTasks.data).toEqual("object");
    expect(typeof loadTasks.error).toEqual("object");

    expect(typeof loadUsers.loading).toEqual("boolean");
    expect(typeof loadUsers.loaded).toEqual("boolean");
    expect(typeof loadUsers.data).toEqual("object");
    expect(typeof loadUsers.error).toEqual("object");

    expect(typeof updateUser.running).toBe("boolean");
    expect(typeof updateUser.finished).toBe("boolean");
    expect(typeof updateUser.runMutation).toBe("function");

    return null;
  };

  client1.nextResult = { data: {} };
  let wrapper = mount(<ComponentToUse />);
  wrapper.setProps({ x: 12 });
  wrapper.setProps({ x: 13 });
  wrapper.update();
  wrapper.setProps({ x: 13 });
  await pause(wrapper);
});
