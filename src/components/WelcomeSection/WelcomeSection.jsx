"use client";

import styles from "./WelcomeSection.module.css";
import Image from "next/image";
import { motion } from "framer-motion";

const WelcomeSection = () => {
  return (
    <section className={styles.welcomeSection}>
      <div className={styles.contentBox}>
        <motion.h6
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={styles.subHeading}
        >
          INDO INVESTORS / Simplifying Your Realty Needs
        </motion.h6>

        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.heading}
        >
          Your Trusted Partner for Hassle-Free Investments
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className={styles.description}
        >
          We help you explore the best properties with seamless financing options and top-notch support. Join thousands of satisfied clients today.
        </motion.p>

        <motion.button
          className={styles.ctaButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Book Project Preview
        </motion.button>
      </div>

      <div className={styles.imageBox}>
        <Image
          src="/images/welcome/bg.jpg"
          alt="Signing a document"
          fill
          priority
          className={styles.backgroundImage}
        />
        <div className={styles.overlay} />
      </div>
    </section>
  );
};

export default WelcomeSection;
