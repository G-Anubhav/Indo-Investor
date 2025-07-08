'use client';

import React from 'react';
import styles from './BrochureSection.module.css';
import { motion } from 'framer-motion';
import { FaDownload, FaFilePdf } from 'react-icons/fa';

const BrochureSection = ({ data }) => {
  if (!data.brochureUrl) return null;

  // Derive preview image by replacing .pdf with .jpg
  const previewImage = data.brochureUrl.replace(/\.pdf$/, '.jpg');

  return (
    <section id="brochure" className={styles.brochureSection}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.heading}>Download Brochure</h2>

          <div className={styles.card}>
            <div className={styles.preview}>
              <img src={previewImage} alt="Brochure Preview" />
            </div>

            <div className={styles.content}>
              <p>Get the complete brochure with pricing, floor plans, and more.</p>
              <a
                href={data.brochureUrl}
                className={styles.downloadBtn}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaDownload /> Download Brochure
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};


export default BrochureSection;
