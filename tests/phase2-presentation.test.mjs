import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFocusedTree,
  canUseTemporaryRoot,
  emptySlotsForNode,
  plotVisualState,
  safeNetworkLeg,
  safeNetworkStatus,
  safePage,
} from "../src/lib/phase2/presentation.mjs";

const rows = [
  { user_id: "root", parent_user_id: null, placement_leg: null, member_code: "IIIW1002", depth: 0 },
  { user_id: "left", parent_user_id: "root", placement_leg: "left", member_code: "IIIW1003", depth: 1 },
  { user_id: "right", parent_user_id: "root", placement_leg: "right", member_code: "IIIW1004", depth: 1 },
  { user_id: "deep", parent_user_id: "left", placement_leg: "left", member_code: "IIIW1005", depth: 2 },
];

test("focused tree preserves left and right placement", () => {
  const tree = buildFocusedTree(rows, 3);
  assert.equal(tree.children.left.user_id, "left");
  assert.equal(tree.children.right.user_id, "right");
  assert.equal(tree.children.left.children.left.user_id, "deep");
});

test("focused tree identifies empty positions", () => {
  const tree = buildFocusedTree(rows, 3);
  assert.deepEqual(emptySlotsForNode(tree.children.right), [
    { sponsorCode: "IIIW1004", leg: "left" },
    { sponsorCode: "IIIW1004", leg: "right" },
  ]);
});

test("temporary roots must belong to the visible subtree", () => {
  assert.equal(canUseTemporaryRoot("root", "left", rows), true);
  assert.equal(canUseTemporaryRoot("root", "outside", rows), false);
  assert.equal(canUseTemporaryRoot("root", "root", rows), false);
});

test("inventory and query values are normalized", () => {
  assert.equal(plotVisualState("token_hold"), "hold");
  assert.equal(plotVisualState("sold"), "sold");
  assert.equal(safePage("3"), 3);
  assert.equal(safePage("-2"), 1);
  assert.equal(safeNetworkStatus("pending_kyc"), "pending_kyc");
  assert.equal(safeNetworkStatus("admin"), null);
  assert.equal(safeNetworkLeg("right"), "right");
  assert.equal(safeNetworkLeg("center"), null);
});
