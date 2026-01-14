"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFilePdf,
  FaEye,
  FaLock,
  FaTimes,
} from "react-icons/fa";
import styles from "./PropertyDocuments.module.css";

const PropertyDocuments = ({ data }) => {
  const [activeDoc, setActiveDoc] = useState(null);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>{data.title}</h2>
          <p>{data.subtitle}</p>
        </motion.div>

        {/* Document Cards */}
        <div className={styles.grid}>
          {data.documents.map((doc, index) => (
            <motion.div
              key={index}
              className={styles.card}
              whileHover={{ y: -6 }}
            >
              <div className={styles.icon}>
                <FaFilePdf />
              </div>

              <h4>{doc.title}</h4>
              {/* <p>{doc.description}</p> */}

              <button
                className={styles.viewBtn}
                onClick={() => setActiveDoc(doc)}
              >
                <FaEye />
                View Document
              </button>

              <span className={styles.confidential}>
                <FaLock /> Confidential – View Only
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* PDF Viewer Overlay */}
      <AnimatePresence>
        {activeDoc && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className={styles.backdrop}
              onClick={() => setActiveDoc(null)}
            />

            <motion.div
              className={styles.viewer}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <div className={styles.viewerHeader}>
                <h4>{activeDoc.title}</h4>
                <button onClick={() => setActiveDoc(null)}>
                  <FaTimes />
                </button>
              </div>

              {/* View-only PDF */}
              <iframe
                src={`${activeDoc.file}#toolbar=0&navpanes=0&scrollbar=0`}
                title={activeDoc.title}
                className={styles.iframe}
              />

              <div className={styles.notice}>
                <FaLock />
                This document is confidential and cannot be downloaded.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PropertyDocuments;
