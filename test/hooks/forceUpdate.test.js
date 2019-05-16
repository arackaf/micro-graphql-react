import { React, render, ClientMock, setDefaultClient, useQuery, useMutation } from "../testSuiteInitialize";
import { pause } from "../testUtils";

const LOAD_TASKS = "A";
const LOAD_USERS = "B";
const UPDATE_USER = "M";

let client1;
let ComponentToUse;
let renders = 0;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  renders = 0;
});

test("loading props passed initially", async () => {
  const ComponentToUse = props => {
    const loadTasks = useQuery([LOAD_TASKS, { assignedTo: props.assignedTo }]);
    renders++;

    return null;
  };

  client1.nextResult = { data: {} };
  let { rerender } = render(<ComponentToUse />);
  let currentRenderCount = renders;

  client1.forceUpdate(LOAD_TASKS);
  expect(renders).toBeGreaterThan(currentRenderCount);

  currentRenderCount = renders;
  client1.forceUpdate(LOAD_USERS);
  expect(renders).toBe(currentRenderCount);
});
