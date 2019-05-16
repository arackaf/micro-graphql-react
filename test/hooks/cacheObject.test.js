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

test("Cache object behaves correctly", async () => {
  const ComponentToUse = props => {
    const loadTasks = useQuery([LOAD_TASKS, { a: 12 }]);
    return null;
  };

  client1.nextResult = { data: {} };
  let { rerender } = render(<ComponentToUse />);

  expect(typeof client1.getCache(LOAD_TASKS)).toBe("object");
  expect(typeof client1.getCache(LOAD_USERS)).toBe("undefined");

  expect(typeof client1.getCache(LOAD_TASKS).get(client1.getGraphqlQuery({ query: LOAD_TASKS, variables: { a: 12 } }))).toBe("object");
  expect(client1.getCache(LOAD_TASKS).keys.length).toBe(1);
});
