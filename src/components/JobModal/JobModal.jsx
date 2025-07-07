"use client";
import React from "react";
import styles from "./JobModal.module.css";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const JobModal = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>

          <div className={styles.modalHeader}>
            <h2>{job.title}</h2>
            <p>
              <strong>Experience:</strong> {job.experience} Years
              <br />
              <strong>Location:</strong> {job.location}
            </p>
          </div>

          <div className={styles.scrollableContent}>
            <h4>Roles and Responsibilities:</h4>
            <p>{job.roles}</p>

            <h4>{job.faqTitle}</h4>
            <p>{job.faqContent}</p>
          </div>

          <div className={styles.footer}>
            <p>
              <strong>To apply on this job, email your resume</strong> at{" "}
              <a href={`mailto:${job.email}`}>{job.email}</a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JobModal;
