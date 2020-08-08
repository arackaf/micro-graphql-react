import { React, render, ClientMock, setDefaultClient, Cache } from "../testSuiteInitialize";
import { deferred, dataPacket, hookComponentFactory, pause } from "../testUtils";

test("Basic clone", async () => {
  let c = new Cache();
  c._cache.set("a", { val: "a" });
  c._cache.set("b", { val: "b" });
  c._cache.set("c", { val: "c" });

  expect([...c.clone()._cache.entries()]).toEqual([
    ["a", { val: "a" }],
    ["b", { val: "b" }],
    ["c", { val: "c" }]
  ]);
});

test("Filtered clone", async () => {
  let c = new Cache();
  c._cache.set("a", { val: "a" });
  c._cache.set("b", { val: "b" });
  c._cache.set("c", { val: "c" });

  expect([...c.clone(([x]) => x != "b")._cache.entries()]).toEqual([
    ["a", { val: "a" }],
    ["c", { val: "c" }]
  ]);
});
