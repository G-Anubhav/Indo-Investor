'use client';

import React from 'react';
import styles from './AmenitiesSection.module.css';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

const AmenitiesSection = ({ amenities }) => {
  if (!amenities || amenities.length === 0) return null;

  return (
    <section id="amenities" className={styles.amenitiesSection}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.heading}>Amenities</h2>
          <div className={styles.grid}>
            {amenities.map((item, index) => (
              <div className={styles.card} key={index}>
                <div className={styles.iconWrapper}>
                  {item.icon ? (
                    <img src={item.icon} alt={item.label} />
                  ) : (
                    <FaCheckCircle className={styles.defaultIcon} />
                  )}
                </div>
                <p className={styles.label}>{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AmenitiesSection;
