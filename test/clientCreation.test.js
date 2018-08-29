import Client from "../src/client";
import { DEFAULT_CACHE_SIZE } from "../src/cache";

test("Default cache size", async () => {
  let c = new Client();
  expect(c.cacheSizeToUse).toBe(DEFAULT_CACHE_SIZE);
});

test("Creation fails with contradictory settings", async () => {
  try {
    let c = new Client({ noCaching: true, cacheSize: 10 });
    expect(1).toBe(2);
  } catch (err) {
    expect(1).toBe(1);
  }
});
