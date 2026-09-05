"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { FaArrowLeft, FaPlus, FaUser } from "react-icons/fa";
import { buildFocusedTree } from "@/lib/phase2/presentation.mjs";
import styles from "./NetworkTree.module.css";

function EmptyNode({ parent, leg, dictionary }) {
  const label = leg === "left" ? dictionary.emptyLeft : dictionary.emptyRight;
  const href = `/signup?sponsor=${encodeURIComponent(parent.member_code)}&leg=${leg}`;
  return (
    <Link className={styles.emptyNode} href={href} aria-label={`${label}. ${dictionary.registerHere}`}>
      <FaPlus aria-hidden="true" />
      <strong>{label}</strong>
      <span>{dictionary.registerHere}</span>
    </Link>
  );
}

function MemberNode({ node, dictionary, onFocus, isRoot }) {
  const children = ["left", "right"];
  return (
    <div className={styles.branch}>
      <button
        className={styles.memberNode}
        data-root={isRoot || undefined}
        onDoubleClick={() => onFocus(node.user_id)}
        title={dictionary.focusNode}
        type="button"
      >
        <FaUser aria-hidden="true" />
        <strong>{node.display_name}</strong>
        <span>{node.member_code}</span>
        <div className={styles.nodeDetails} role="tooltip">
          <span><b>{dictionary.rank}:</b> {node.rank_name || dictionary.unavailable}</span>
          <span><b>{dictionary.salesVolume}:</b> {node.sales_volume ?? dictionary.unavailable}</span>
          <span><b>{dictionary.totalDownline}:</b> {node.total_downline_count ?? dictionary.unavailable}</span>
        </div>
      </button>
      {!node.depthLimited && (
        <div className={styles.children}>
          {children.map((leg) => (
            <div className={styles.child} data-leg={leg} key={leg}>
              <span className={styles.legLabel}>{dictionary[leg]}</span>
              {node.children[leg]
                ? <MemberNode node={node.children[leg]} dictionary={dictionary} onFocus={onFocus} />
                : <EmptyNode parent={node} leg={leg} dictionary={dictionary} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NetworkTree({ rows, originalRootId, currentRootId, dictionary }) {
  const router = useRouter();
  const viewportRef = useRef(null);
  const tree = buildFocusedTree(rows, 3);
  const isTemporary = originalRootId !== currentRootId;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const centerRoot = () => {
      const rootNode = viewport.querySelector("[data-root]");
      if (!rootNode) return;
      viewport.scrollLeft = rootNode.offsetLeft + (rootNode.offsetWidth / 2) - (viewport.clientWidth / 2);
    };

    const frame = requestAnimationFrame(centerRoot);
    window.addEventListener("resize", centerRoot);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", centerRoot);
    };
  }, [currentRootId]);

  if (!tree) return <p className={styles.empty}>{dictionary.treeEmpty}</p>;

  function focusNode(userId) {
    if (userId === currentRootId) return;
    router.push(`/network?root=${encodeURIComponent(userId)}`);
  }

  return (
    <section>
      <div className={styles.contextBar}>
        <div>
          <span>{isTemporary ? dictionary.currentRoot : dictionary.originalRoot}</span>
          <strong>{tree.display_name} | {tree.member_code}</strong>
        </div>
        {isTemporary && (
          <Link href="/network"><FaArrowLeft aria-hidden="true" /> {dictionary.backToRoot}</Link>
        )}
      </div>
      <div className={styles.viewport} ref={viewportRef}>
        <div className={styles.treeCanvas}>
          <MemberNode node={tree} dictionary={dictionary} onFocus={focusNode} isRoot />
        </div>
      </div>
    </section>
  );
}
