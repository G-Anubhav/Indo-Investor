'use client';

import React from 'react';
import styles from './VideoTourSection.module.css';
import { motion } from 'framer-motion';

const VideoTourSection = ({ videoUrl }) => {
  if (!videoUrl) return null;

  return (
    <section id="video" className={styles.videoSection}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.heading}>Video Tour</h2>
          <div className={styles.videoWrapper}>
            <iframe
              src={videoUrl}
              title="Video Tour"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoTourSection;
