"use client";

import styles from "./CTASection.module.css";
import Image from "next/image";

const CTASection = () => {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.wrapper}>
          {/* Left Image */}
          <div className={styles.leftImage}>
            <Image src="/images/cta/house.png" alt="House" width={500} height={500} />
          </div>

          {/* Center Content */}
          <div className={styles.centerContent}>
            <p className={styles.subText}>Any Questions ?</p>
            <h2 className={styles.phone}>897–876–987–90</h2>

            <div className={styles.buttonGroup}>
              <button className={styles.callButton}>MAKE A CALL</button>
              <button className={styles.outlineButton}>CONTACT US</button>
            </div>
          </div>

          {/* Right Image */}
          <div className={styles.rightImage}>
            <Image src="/images/cta/person.png" alt="Person" width={400} height={500} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
