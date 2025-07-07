"use client";

import React from "react";
import styles from "./OurValuesSection.module.css";
import { motion } from "framer-motion";
import { FaHandshake, FaLightbulb, FaUsers, FaShieldAlt } from "react-icons/fa";

const values = [
  {
    icon: <FaHandshake />,
    title: "Integrity",
    desc: "We do the right thing, even when no one is watching. Honesty and ethics drive our every action.",
  },
  {
    icon: <FaLightbulb />,
    title: "Innovation",
    desc: "We're always improving—adapting new technologies and smarter strategies for better results.",
  },
  {
    icon: <FaUsers />,
    title: "Customer Focus",
    desc: "We build lasting relationships by putting your needs at the center of everything we do.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Reliability",
    desc: "You can count on us to deliver on our promises with consistency and dedication.",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const OurValuesSection = () => {
  return (
    <section className={styles.valuesSection}>
      <div className="container">
        <motion.p
          className={styles.label}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          Our Values
        </motion.p>

        <motion.h2
          className={styles.heading}
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          What We Stand For
        </motion.h2>

        <motion.p
          className={styles.subheading}
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          The foundation of everything we do lies in our principles and commitment to you.
        </motion.p>

        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {values.map((val, i) => (
            <motion.div key={i} className={styles.card} whileHover={{ y: -5 }} variants={itemVariants}>
              <div className={styles.icon}>{val.icon}</div>
              <h4>{val.title}</h4>
              <p>{val.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default OurValuesSection;
