import assert from "node:assert/strict";
import { test } from "node:test";
import { repoOfKey, starsInLastDays, type StarWeek } from "../src/candidates/github-stars.js";

test("repo key: only github:owner/repo keys name a repo", () => {
  assert.equal(repoOfKey("github:acme/tool"), "acme/tool");
  assert.equal(repoOfKey("github:acme/tool.js"), "acme/tool.js");
  assert.equal(repoOfKey("github:acme"), null);
  assert.equal(repoOfKey("apple:123"), null);
  assert.equal(repoOfKey("acme.app"), null);
});

// Shape of a real stargazers/history reply (HolyArrs/HolyArrs, read 2026-11-23): newest week first.
const REAL_WEEKS: StarWeek[] = [
  { week: 1795305600, total: 133, days: [118, 15, 0, 0, 0, 0, 0] },
  { week: 1794700800, total: 1453, days: [88, 102, 43, 641, 257, 169, 153] },
];

test("stars window: sums the last 7 UTC days including today, from both weeks", () => {
  // 17-23 Nov: 43 + 641 + 257 + 169 + 153 + 118 + 15 = 1396; the 16 Nov day (102) is outside.
  assert.equal(starsInLastDays(REAL_WEEKS, new Date("2026-11-23T12:30:00Z")), 1396);
});

test("stars window: a day that starts before the window is not counted", () => {
  // Window 16-22 Nov (7 days ending 22 Nov): 102 + 43 + 641 + 257 + 169 + 153 + 118 = 1483.
  assert.equal(starsInLastDays(REAL_WEEKS, new Date("2026-11-22T00:00:00Z")), 1483);
  assert.equal(starsInLastDays([], new Date("2026-11-23T00:00:00Z")), 0);
});
