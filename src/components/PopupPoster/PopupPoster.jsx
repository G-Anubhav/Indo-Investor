"use client";
import React, { useEffect, useState } from "react";
import styles from "./PopupPoster.module.css";

export default function FarmhousePopup({ delay = 1500, expireMinutes = 1 }) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    console.log("[FarmhousePopup] mounted");

    let alreadyShown = false;
    try {
      const raw = localStorage.getItem("farmhousePopupShown");
      if (raw) {
        const parsed = JSON.parse(raw);
        const shownAt = parsed?.shownAt || 0;
        const minutes = parsed?.expireMinutes ?? expireMinutes;
        const age = Date.now() - shownAt;
        if (shownAt && age < minutes * 60 * 1000) {
          alreadyShown = true;
          console.log("[FarmhousePopup] not expired yet:", parsed);
        } else {
          console.log("[FarmhousePopup] expired, will show again");
        }
      }
    } catch (err) {
      console.warn("[FarmhousePopup] localStorage read failed:", err);
    }

    if (alreadyShown) return;

    const t = setTimeout(() => {
      console.log("[FarmhousePopup] showing popup");
      setShowPopup(true);
    }, delay);

    return () => clearTimeout(t);
  }, [delay, expireMinutes]);

  const markAsShown = () => {
    try {
      localStorage.setItem(
        "farmhousePopupShown",
        JSON.stringify({ shownAt: Date.now(), expireMinutes })
      );
      console.log("[FarmhousePopup] marked as shown");
    } catch (err) {
      console.warn("[FarmhousePopup] write failed:", err);
    }
  };

  const closePopup = () => {
    markAsShown();
    setShowPopup(false);
  };

  const handleExplore = (e) => {
    e?.preventDefault();
    markAsShown();
    window.location.href = "/properties/residential/dholera-sky-rise-residency";
  };

  if (!showPopup) return null;

  const onOverlayClick = (e) => {
    if (e.target === e.currentTarget) closePopup();
  };

  return (
    <div className={styles.overlay} onClick={onOverlayClick}>
      <div className={styles.popup}>
        <div className={styles.posterWrapper}>
          <img
            src="/images/all-properties/residential/dholera-sky-rise/poster.png"
            alt="Farmhouse Project"
            className={styles.poster}
          />
          <div className={styles.gradient} />
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>
            Indo Investor Infra Presents: Exclusive Residential Township
          </h2>
          <p className={styles.subtitle}>
            Green Vista Residential Township, Dholera — Book Your Slice of Paradise Today!
          </p>

          <div className={styles.actions}>
            <button className={styles.cta} onClick={handleExplore}>
              Explore Now
            </button>
            {/* <button className={styles.secondary} onClick={closePopup}>
              Maybe Later
            </button> */}
          </div>
        </div>

        <button className={styles.closeBtn} onClick={closePopup}>
          ✕
        </button>
      </div>
    </div>
  );
}
