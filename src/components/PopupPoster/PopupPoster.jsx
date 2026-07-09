"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./PopupPoster.module.css";

export default function PopupPoster({ delay = 900 }) {
  const [showPopup, setShowPopup] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname !== "/") {
      setShowPopup(false);
      return;
    }

    const timer = setTimeout(() => setShowPopup(true), delay);
    return () => clearTimeout(timer);
  }, [delay, pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleHomeClick = (event) => {
      const link = event.target.closest?.("a[href='/']");
      if (link) setShowPopup(true);
    };

    document.addEventListener("click", handleHomeClick);
    return () => document.removeEventListener("click", handleHomeClick);
  }, []);

  const closePopup = () => {
    setShowPopup(false);
  };

  const onOverlayClick = (event) => {
    if (event.target === event.currentTarget) closePopup();
  };

  if (!showPopup) return null;

  return (
    <div className={styles.overlay} onClick={onOverlayClick}>
      <div className={styles.popup} role="dialog" aria-modal="true">
        <Link
          href="/contact-us"
          className={styles.posterLink}
          aria-label="Contact us for the Patna event"
        >
          <img
            src="/images/event/patna-event-july.jpg"
            alt="Patna event July"
            className={styles.poster}
          />
        </Link>

        <button
          className={styles.closeBtn}
          onClick={closePopup}
          aria-label="Close event popup"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
