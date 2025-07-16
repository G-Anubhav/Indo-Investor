'use client';

import React from 'react';
import styles from './FloatingContactButtons.module.css';
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';

const FloatingContactButtons = () => {
  return (
    <div className={styles.floatingContainer}>
      <a
        href="https://wa.me/8448362126?text=Hi%2C%20I%20came%20across%20your%20website%20and%20would%20like%20to%20know%20more%20about%20your%20services."
        className={`${styles.floatingBtn} ${styles.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Chat"
      >
        <FaWhatsapp />
        <span className={styles.tooltip}>Chat on WhatsApp</span>
      </a>

      <a
        href="tel:+918448362126"
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
