"use client";

import React from "react";
import styles from "./OurValuesSection.module.css";
import { motion } from "framer-motion";
import { FaUsers, FaShieldAlt, FaSearchLocation, FaHandsHelping } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { RiUserStarFill } from "react-icons/ri";
import { TbHours24 } from "react-icons/tb";

const values = [
  {
    icon: <MdVerified />,
    title: "Verified & Legally Clear Properties",
    desc: "Every project undergoes rigorous due diligence, so your investment remains 100% secure and worry-free.",
  },
  {
    icon: <FaSearchLocation />,
    title: "High Appreciation Locations",
    desc: "We focus on emerging growth corridors that maximize future appreciation of your investment.",
  },
  {
    icon: <FaHandsHelping />,
    title: "Transparent Deals",
    desc: "No hidden fees, no last-minute surprises. We build trust through complete clarity.",
  },
  {
    icon: <RiUserStarFill />,
    title: "Expert Guidance",
    desc: "From selecting the right location to hassle-free paperwork, our experienced team is by your side every step of the way.",
  },
  {
    icon: <TbHours24 />,
    title: "After-Sales Support",
    desc: "Our relationship continues well beyond the purchase. Whether it’s site visits, documentation, resale, or future construction — we’re always here to assist.",
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
          We Stand Apart
        </motion.p>

        <motion.h2
          className={styles.heading}
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Why Choose Indo Investors?
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
