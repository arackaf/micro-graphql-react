import Client from "../src/client";
import { DEFAULT_CACHE_SIZE } from "../src/cache";

test("Default cache size", async () => {
  let c = new Client();
  expect(c.cacheSizeToUse).toBe(DEFAULT_CACHE_SIZE);
});