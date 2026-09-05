export const NETWORK_LEGS = ["left", "right"];
export const NETWORK_STATUSES = ["active", "hold", "pending_kyc"];

export function buildFocusedTree(rows, maxDepth = 3) {
  if (!Array.isArray(rows) || rows.length === 0) return null;

  const nodes = new Map(
    rows.map((row) => [row.user_id, { ...row, children: { left: null, right: null } }]),
  );

  for (const node of nodes.values()) {
    if (node.parent_user_id && nodes.has(node.parent_user_id) && NETWORK_LEGS.includes(node.placement_leg)) {
      nodes.get(node.parent_user_id).children[node.placement_leg] = node;
    }
  }

  const root = nodes.get(rows[0].user_id) || nodes.values().next().value;

  function trim(node) {
    if (!node) return null;
    if (node.depth >= maxDepth) return { ...node, children: { left: null, right: null }, depthLimited: true };
    return {
      ...node,
      children: {
        left: trim(node.children.left),
        right: trim(node.children.right),
      },
      depthLimited: false,
    };
  }

  return trim(root);
}

export function emptySlotsForNode(node, maxDepth = 3) {
  if (!node || node.depth >= maxDepth) return [];
  return NETWORK_LEGS.filter((leg) => !node.children?.[leg]).map((leg) => ({
    sponsorCode: node.member_code,
    leg,
  }));
}

export function canUseTemporaryRoot(originalRootId, candidateId, visibleRows) {
  if (!candidateId || candidateId === originalRootId) return false;
  return visibleRows.some((row) => row.user_id === candidateId);
}

export function plotVisualState(status) {
  if (status === "available") return "available";
  if (status === "token_hold") return "hold";
  if (status === "sold") return "sold";
  return "unknown";
}

export function safePage(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function safeNetworkStatus(value) {
  return NETWORK_STATUSES.includes(value) ? value : null;
}

export function safeNetworkLeg(value) {
  return NETWORK_LEGS.includes(value) ? value : null;
}
