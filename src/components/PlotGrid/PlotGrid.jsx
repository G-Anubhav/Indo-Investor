"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FaCheck, FaClock, FaTimes, FaUndo } from "react-icons/fa";
import { acquirePlotHoldAction, releasePlotHoldAction } from "@/app/actions/phase2";
import { plotVisualState } from "@/lib/phase2/presentation.mjs";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import styles from "./PlotGrid.module.css";

function formatPrice(value, locale) {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat(locale, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value));
}

function PlotIcon({ status }) {
  if (status === "available") return <FaCheck aria-hidden="true" />;
  if (status === "token_hold") return <FaClock aria-hidden="true" />;
  return <FaTimes aria-hidden="true" />;
}

export default function PlotGrid({ project, initialPlots, currentUserId, dictionary, locale }) {
  const router = useRouter();
  const [plots, setPlots] = useState(initialPlots);
  const [selectedId, setSelectedId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [liveState, setLiveState] = useState("connecting");
  const [isPending, startTransition] = useTransition();
  const refreshTimer = useRef(null);
  const selected = plots.find((plot) => plot.id === selectedId) || null;
  const maxColumn = Math.max(1, ...plots.map((plot) => Number(plot.grid_column)));

  useEffect(() => setPlots(initialPlots), [initialPlots]);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const refresh = () => {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => router.refresh(), 250);
    };
    const channel = supabase
      .channel(`plots:${project.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "plots",
        filter: `project_id=eq.${project.id}`,
      }, (payload) => {
        setPlots((current) => current.map((plot) => plot.id === payload.new.id ? { ...plot, ...payload.new } : plot));
        setLiveState("updated");
        refresh();
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setLiveState("connected");
          refresh();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setLiveState("reconnecting");
        }
      });

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(refreshTimer.current);
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [project.id, router]);

  const liveLabel = useMemo(() => {
    if (liveState === "connected") return dictionary.realtimeConnected;
    if (liveState === "updated") return dictionary.inventoryUpdated;
    return dictionary.realtimeReconnecting;
  }, [dictionary, liveState]);

  function mutate(action) {
    setFeedback(null);
    startTransition(async () => {
      const result = await action(selected.id, project.slug);
      setFeedback(result.ok
        ? (action === acquirePlotHoldAction ? dictionary.holdCreated : dictionary.holdReleased)
        : dictionary[result.code] || dictionary.network_error);
      router.refresh();
    });
  }

  return (
    <>
      <div className={styles.inventoryBar}>
        <div className={styles.legend} aria-label={dictionary.legend}>
          {[
            ["available", dictionary.available],
            ["hold", dictionary.token_hold],
            ["sold", dictionary.sold],
          ].map(([status, label]) => <span key={status}><i data-status={status} />{label}</span>)}
        </div>
        <span className={styles.liveStatus} data-state={liveState}><i />{liveLabel}</span>
      </div>

      <div className={styles.viewport}>
        <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${maxColumn}, 92px)` }}>
          {plots.map((plot) => {
            const visual = plotVisualState(plot.status);
            const heldByCurrentUser = plot.held_by_user_id === currentUserId;
            return (
              <button
                className={`${styles.plotCell} ${styles[visual]}`}
                data-owned={heldByCurrentUser || undefined}
                key={plot.id}
                onClick={() => { setSelectedId(plot.id); setFeedback(null); }}
                style={{ gridColumn: plot.grid_column, gridRow: plot.grid_row }}
                type="button"
                aria-label={`${dictionary.plot} ${plot.plot_number}, ${dictionary[plot.status]}`}
              >
                <PlotIcon status={plot.status} />
                <strong>{plot.plot_number}</strong>
                <span>{heldByCurrentUser ? dictionary.holdByYou : dictionary[plot.status]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedId(null)}>
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="plot-dialog-title">
            <button className={styles.closeButton} type="button" onClick={() => setSelectedId(null)} title={dictionary.close}><FaTimes /></button>
            <span className={styles.dialogEyebrow}>{dictionary.status}: {dictionary[selected.status]}</span>
            <h2 id="plot-dialog-title">{dictionary.plot} {selected.plot_number}</h2>
            <dl>
              <div><dt>{dictionary.area}</dt><dd>{selected.area_sq_yd ? `${selected.area_sq_yd} sq. yd.` : dictionary.unavailable}</dd></div>
              <div><dt>{dictionary.dimensions}</dt><dd>{selected.dimensions || dictionary.unavailable}</dd></div>
              <div><dt>{dictionary.price}</dt><dd>{formatPrice(selected.price, locale) || dictionary.unavailable}</dd></div>
              {selected.status === "token_hold" && selected.hold_expires_at && <div><dt>{dictionary.expires}</dt><dd>{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(selected.hold_expires_at))}</dd></div>}
            </dl>
            {selected.status === "available" && <p>{dictionary.holdExplanation}</p>}
            {feedback && <p className={styles.feedback}>{feedback}</p>}
            {selected.status === "available" && <button className={styles.actionButton} disabled={isPending} onClick={() => mutate(acquirePlotHoldAction)} type="button"><FaClock />{dictionary.createHold}</button>}
            {selected.status === "token_hold" && selected.held_by_user_id === currentUserId && <button className={styles.releaseButton} disabled={isPending} onClick={() => mutate(releasePlotHoldAction)} type="button"><FaUndo />{dictionary.releaseHold}</button>}
          </section>
        </div>
      )}
    </>
  );
}
