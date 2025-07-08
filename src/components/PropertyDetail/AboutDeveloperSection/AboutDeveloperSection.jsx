'use client';

import React from 'react';
import styles from './AboutDeveloperSection.module.css';
import { motion } from 'framer-motion';

const AboutDeveloperSection = ({ developer }) => {
  if (!developer) return null;

  const { name, description, image } = developer;

  return (
    <section id="developer" className={styles.developerSection}>
      <div className="container">
        <motion.div
          className={styles.wrapper}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className={styles.imageWrapper}>
            <img src={image} alt={name} />
          </div>

          <div className={styles.content}>
            <h2 className={styles.heading}>About the Developer</h2>
            <h3 className={styles.name}>{name}</h3>
            <p className={styles.text}>{description}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutDeveloperSection;
