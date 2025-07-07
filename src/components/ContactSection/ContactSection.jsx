"use client";
import React from "react";
import styles from "./ContactSection.module.css";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const ContactSection = () => {
  return (
    <section className={styles.contactSection}>
      <div className="container">
        {/* Heading */}
        <div className={styles.headingWrapper}>
          <span className={styles.subheading}>GET IN TOUCH WITH US</span>
          <h2 className={styles.heading}>We'd love to hear from you</h2>
          {/* <p className={styles.subheading}>
            <span className={styles.line}></span>
            GET IN TOUCH WITH US
            <span className={styles.line}></span>
          </p>
          <h2 className={styles.heading}>We'd love to hear from you</h2> */}
        </div>

        {/* Contact Grid */}
        <div className={styles.contactGrid}>
          {/* Left Panel */}
          <motion.div
            className={styles.leftPanel}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h5 className={styles.subtitle}>Catch Us</h5>
            <h2 className={styles.title}>Get in Touch</h2>

            <div className={styles.infoBlock}>
              <FaMapMarkerAlt className={styles.icon} />
              <div>
                <h4>Our Location</h4>
                <p>71 Madison Ave 10013<br />New York, USA</p>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <FaPhoneAlt className={styles.icon} />
              <div>
                <h4>Give Us A Call</h4>
                <p>+6500-37-564-35</p>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <FaEnvelope className={styles.icon} />
              <div>
                <h4>Email Us</h4>
                <p>contact@ochahouse.com</p>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Form */}
          <motion.form
            className={styles.form}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <input type="text" placeholder=" " required />
                <label>First Name *</label>
              </div>
              <div className={styles.inputField}>
                <input type="text" placeholder=" " required />
                <label>Last Name *</label>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <input type="tel" placeholder=" " required />
                <label>Phone Number *</label>
              </div>
              <div className={styles.inputField}>
                <input type="email" placeholder=" " required />
                <label>Email *</label>
              </div>
            </div>

            <div className={styles.textareaField}>
              <textarea rows="5" placeholder=" " required></textarea>
              <label>Message</label>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Send Message
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
