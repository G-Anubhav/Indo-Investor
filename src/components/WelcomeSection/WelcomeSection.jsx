"use client";
import Link from "next/link";
import styles from "./WelcomeSection.module.css";
import Image from "next/image";
import { motion } from "framer-motion";

const LinkComponent = ({ href, children }) => {
  return (
    <Link href={href} passHref>
      {children}
    </Link>
  );
};

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
          INDO INVESTORS MISSION / Simplifying Your Realty Needs
        </motion.h6>

        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.heading}
        >
          To empower individuals and families to achieve financial freedom through secure, transparent, and growth-driven real estate investments.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className={styles.description}
        >
          We bridge the gap between quality real estate assets and investors by offering verified projects, honest expert advice, and complete end-to-end support. <br /> Our primary focus areas include Noida, Greater Noida, NCR, and rapidly emerging hotspots like Jewar (near the upcoming International Airport) — along with selective opportunities in promising regions across India.
        </motion.p>

        <motion.button
          className={styles.ctaButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Book Project Preview
        </motion.button>

        {/* <LinkComponent  href="/contact-us">
          <motion.a
            className={styles.ctaButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book Project Preview
          </motion.a>
        </LinkComponent > */}
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
