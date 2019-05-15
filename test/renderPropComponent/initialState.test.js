import { render } from "react-testing-library";
import { React, Component, ClientMock, setDefaultClient, GraphQL, buildQuery } from "../testSuiteInitialize";

const LOAD_TASKS = "A";
const LOAD_USERS = "B";
const UPDATE_USER = "M";

let client1;
let ComponentToUse;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

test("loading props passed initially", async () => {
  class ComponentToUse extends Component {
    render() {
      return (
        <GraphQL
          query={{
            loadTasks: [LOAD_TASKS, { assignedTo: this.props.assignedTo }],
            loadUsers: [LOAD_USERS, { name: this.props.name }]
          }}
          mutation={{ updateUser: UPDATE_USER }}
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
  let { rerender } = render(<ComponentToUse />);

  rerender(<ComponentToUse x={12} />);
  rerender(<ComponentToUse x={13} />);
  rerender(<ComponentToUse x={13} />);
});
