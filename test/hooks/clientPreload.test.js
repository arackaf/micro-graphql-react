import { React, render, Component, ClientMock, setDefaultClient, Cache } from "../testSuiteInitialize";
import { deferred, resolveDeferred, hookComponentFactory } from "../testUtils";

let client1;
let client2;
const basicQuery = "A";

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
});

const getComponent = hookComponentFactory([basicQuery, props => ({ page: props.page })]);

const [getProps1, Component1] = getComponent();
const [getProps2, Component2] = getComponent();

describe("Preload", () => {
  test("Preload test 1", async () => {
    client1.nextResult = Promise.resolve({});

    expect(client1.queriesRun).toBe(0);
    client1.preload(basicQuery, {});
    expect(client1.queriesRun).toBe(1);
    client1.preload(basicQuery, {});
    expect(client1.queriesRun).toBe(1);
  });
});
