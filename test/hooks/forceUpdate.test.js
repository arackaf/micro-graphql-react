import { React, render, ClientMock, useRef, setDefaultClient, useQuery, useMutation } from "../testSuiteInitialize";
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

test("force update from client mutation subscription -- string", async () => {
  var lastResults = null;

  const ComponentToUse = props => {
    const hasRun = useRef(false);
    const { data } = useQuery([LOAD_TASKS, { assignedTo: props.assignedTo }]);
    lastResults = data;

    const { runMutation } = useMutation(["X"]);
    renders++;

    if (!hasRun.current && props.run) {
      hasRun.current = true;
      runMutation({});
    }

    return null;
  };
  client1.subscribeMutation({
    when: "a",
    run: ({ refreshActiveQueries }) => {
      let cache = client1.getCache(LOAD_TASKS);

      [...cache._cache.keys()].forEach(k => {
        cache._cache.set(k, { data: { a: 99 } });
      });

      refreshActiveQueries(LOAD_TASKS);
    }
  });
  client1.nextMutationResult = { a: 2 };
  client1.nextResult = { data: { a: 1 } };

  let { rerender } = render(<ComponentToUse />);
  await pause();

  expect(lastResults).toEqual({ a: 1 });
  
  rerender(<ComponentToUse run={true} />);
  await pause();
  
  expect(lastResults).toEqual({ a: 99 });
});

test("force update from client mutation subscription -- regex", async () => {
  var lastResults = null;

  const ComponentToUse = props => {
    const hasRun = useRef(false);
    const { data } = useQuery([LOAD_TASKS, { assignedTo: props.assignedTo }]);
    lastResults = data;

    const { runMutation } = useMutation(["X"]);
    renders++;

    if (!hasRun.current && props.run) {
      hasRun.current = true;
      runMutation({});
    }

    return null;
  };
  client1.subscribeMutation({
    when: /a/,
    run: ({ refreshActiveQueries }) => {
      let cache = client1.getCache(LOAD_TASKS);

      [...cache._cache.keys()].forEach(k => {
        cache._cache.set(k, { data: { a: 99 } });
      });

      refreshActiveQueries(LOAD_TASKS);
    }
  });
  client1.nextMutationResult = { a: 2 };
  client1.nextResult = { data: { a: 1 } };

  let { rerender } = render(<ComponentToUse />);
  await pause();

  expect(lastResults).toEqual({ a: 1 });
  
  rerender(<ComponentToUse run={true} />);
  await pause();
  
  expect(lastResults).toEqual({ a: 99 });
});
