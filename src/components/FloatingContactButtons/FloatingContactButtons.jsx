'use client';

import React from 'react';
import styles from './FloatingContactButtons.module.css';
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';

const FloatingContactButtons = () => {
  return (
    <div className={styles.floatingContainer}>
      <a
        href="https://wa.me/919876543210"
        className={`${styles.floatingBtn} ${styles.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Chat"
      >
        <FaWhatsapp />
        <span className={styles.tooltip}>Chat on WhatsApp</span>
      </a>

      <a
        href="tel:+919876543210"
        className={`${styles.floatingBtn} ${styles.call}`}
        aria-label="Make a Call"
      >
        <FaPhoneAlt />
        <span className={styles.tooltip}>Call Us</span>
      </a>
    </div>
  );
};

export default FloatingContactButtons;
