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
            <h2 className={styles.phone}>012–043–024–35</h2>

            <div className={styles.buttonGroup}>
              {/* <button className={styles.callButton}>MAKE A CALL</button> */}
              <a href="tel:01204302435" className={styles.callButton}>
                MAKE A CALL
              </a>
              {/* <button className={styles.outlineButton}>CONTACT US</button> */}
              <a href="/contact-us" className={styles.outlineButton}>
                CONTACT US
              </a>
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
