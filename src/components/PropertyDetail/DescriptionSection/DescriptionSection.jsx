"use client";

import React from "react";
import styles from "./DescriptionSection.module.css";
import { motion } from "framer-motion";

const DescriptionSection = ({ description }) => {
  const descriptionItems = Array.isArray(description)
    ? description
    : description
      ? [description]
      : [];

  if (descriptionItems.length === 0) return null;

  return (
    <section id="description" className={styles.descriptionSection}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.heading}>Property Description</h2>
          {descriptionItems.map((desc, i) => (
            <p key={i} className={styles.text}>{desc}</p>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DescriptionSection;
