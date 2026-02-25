'use client';

import React from 'react';
import Link from 'next/link';
import styles from './ContactCTASection.module.css';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const ContactCTASection = () => {
  return (
    <section id="contact-cta" className={styles.contactCta}>
      <div className="container">
        <motion.div
          className={styles.contentWrapper}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className={styles.text}>
            <h2>Interested in this property?</h2>
            <p>Talk to our team now or leave a message to schedule a visit!</p>
            <div className={styles.phone}>
              <FaPhoneAlt className={styles.phoneIcon} />
              <Link href="tel:9910464557" >+91 99104 64557</Link>
            </div>
          </div>

          <div className={styles.buttons}>
            <a href="tel:9910464557" className={styles.btnPrimary}>
              <FaPhoneAlt /> Make a Call
            </a>
            <a href="/contact-us" className={styles.btnOutline}>
              <FaEnvelope /> Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactCTASection;
