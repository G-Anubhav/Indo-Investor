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
                <h5>Our Location</h5>
                <p>F-16, First Floor, Block D-242, Sector 63, Noida, Uttar Pradesh 201301</p>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <FaPhoneAlt className={styles.icon} />
              <div>
                <h5>Give Us A Call</h5>
                <a href="tel:01204302435"> 012-043-024-35 </a>
                <a href="tel: 9304301406">+91 9304301406</a>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <FaEnvelope className={styles.icon} />
              <div>
                <h5>Email Us</h5>
                <a href="mailto: info@indoinvestor.com">info@indoinvestor.com</a>
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
              <textarea rows="4" placeholder=" " required></textarea>
              <label>Message</label>
            </div>

            <div className={styles.toggleContainer}>
              <label className={styles.toggleSwitch}>
                <input type="checkbox" required />
                <span className={styles.slider}></span>
              </label>
              <span className={styles.toggleText}>
                By contacting us, you agree to our&nbsp;
                <a href="/terms" target="_blank">Terms of services</a> and&nbsp;
                <a href="/privacy" target="_blank">Privacy Policy</a>.
              </span>
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
