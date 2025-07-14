"use client";
import React from "react";
import styles from "./CareersIntroSection.module.css";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

const CareersIntroSection = () => {
  return (
    <section className={styles.careersIntroSection}>
      <div className="container">
        <motion.div
          className={styles.headingWrapper}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.subheading}>
            {/* <span className={styles.line}></span> */}
            JOIN OUR TALENT COMMUNITY!
            {/* <span className={styles.line}></span> */}
          </div>
          <h2 className={styles.heading}>Career</h2>
        </motion.div>

        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className={styles.tagline}>
            Exciting Careers Await at Indo Investor Infra: Join Our Dynamic Team!
          </h3>
          <p>
            Looking for an exciting career in the real estate industry? Indo Investor Infra is seeking
            talented individuals like you to join our team. We offer a supportive work environment,
            professional growth opportunities, and a chance to make a meaningful impact. Whether
            you have expertise in sales, marketing, finance, or property management, we invite you
            to explore our current job openings.
          </p>
          <p>
            Join us in creating a diverse and inclusive workplace where your skills and passion
            can thrive. Visit our Careers page and take the next step towards an exciting future
            with Indo Investor Infra!
          </p>

          <a href="#jobOpens" className={styles.ctaBtn}>
            View Openings <FaArrowRight className={styles.ctaIcon} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CareersIntroSection;
