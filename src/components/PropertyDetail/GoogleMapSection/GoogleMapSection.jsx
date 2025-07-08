'use client';

import React from 'react';
import styles from './GoogleMapSection.module.css';
import { motion } from 'framer-motion';

const GoogleMapSection = ({ mapEmbedUrl }) => {
  if (!mapEmbedUrl) return null;

  return (
    <section id="location" className={styles.mapSection}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.heading}>Location Map</h2>
          <div className={styles.mapWrapper}>
            <iframe
              src={mapEmbedUrl}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GoogleMapSection;
