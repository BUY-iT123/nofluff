import assert from "node:assert/strict";
import test from "node:test";
import { getCheckNotes, shouldShowPostReady } from "../src/utils/postReady.js";

test("hides Make post-ready for a one-sentence idea", () => {
  assert.equal(shouldShowPostReady("One clear idea."), false);
});

test("shows Make post-ready for multiple sentences with emojis and stretched words", () => {
  assert.equal(shouldShowPostReady("I LOVE this 😭😭. Pleaseeeee keep it!!"), true);
});

test("hides Make post-ready while another response is loading", () => {
  assert.equal(shouldShowPostReady("First idea. Second idea!", true), false);
});

test("keeps unresolved check notes available for an unfinished ending", () => {
  const notes = ["The ending looks unfinished. Did you want to add more?"];
  const result = { text: "The first thought is done. The last one is unfinished because", checks: notes };
  assert.deepEqual(getCheckNotes(result), notes);
  assert.equal(getCheckNotes(result), notes);
});
