import { React, render, ClientMock, setDefaultClient, useQuery } from "../testSuiteInitialize";
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

test("Initial results sync available if possible", async () => {
  const ComponentToUse = props => {
    const loadTasks = useQuery(LOAD_TASKS, { a: 12 });
    return null;
  };

  const ComponentToUseNext = props => {
    const loadTasks = useQuery(LOAD_TASKS, { a: 12 });
    expect(loadTasks.data).not.toBeNull();
    return null;
  };

  client1.nextResult = { data: {} };
  let { rerender } = render(<ComponentToUse />);
  let { rerender_next } = render(<ComponentToUseNext />);
});
