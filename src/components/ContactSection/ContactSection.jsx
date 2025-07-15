"use client";
import React from "react";
import { useState } from "react";
import styles from "./ContactSection.module.css";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const ContactSection = () => {

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
  });

  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/; // Indian 10-digit mobile numbers

    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.message.trim()) newErrors.message = "Message is required.";
    if (!agree) newErrors.agree = "You must accept the terms.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({}); // clear previous

    setIsSending(true);

    try {
      const res = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (result.success) {
        setSuccessMessage("Message sent successfully!");
        setFormData({ firstName: "", lastName: "", phone: "", email: "", message: "" });
        setAgree(false);
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        alert("Failed to send message.");
      }
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className={styles.contactSection}>
      <div className="container">
        {/* Heading */}
        <div className={styles.headingWrapper}>
          <span className={styles.subheading}>GET IN TOUCH WITH US</span>
          <h2 className={styles.heading}>We'd love to hear from you</h2>
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

          {successMessage && (
            <motion.div
              className={styles.success}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {successMessage}
            </motion.div>
          )}

          {/* Right Panel - Form */}
          <motion.form
            className={styles.form}
            onSubmit={handleSubmit}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <input type="text" name="firstName" placeholder=" " value={formData.firstName} onChange={handleChange} />
                <label>First Name *</label>
                {errors.firstName && <p className={styles.error}>{errors.firstName}</p>}
              </div>
              <div className={styles.inputField}>
                <input type="text" name="lastName" placeholder=" " value={formData.lastName} onChange={handleChange} />
                <label>Last Name *</label>
                {errors.lastName && <p className={styles.error}>{errors.lastName}</p>}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <input type="tel" name="phone" placeholder=" " value={formData.phone} onChange={handleChange} />
                <label>Phone Number *</label>
                {errors.phone && <p className={styles.error}>{errors.phone}</p>}
              </div>
              <div className={styles.inputField}>
                <input type="email" name="email" placeholder=" " value={formData.email} onChange={handleChange} />
                <label>Email *</label>
                {errors.email && <p className={styles.error}>{errors.email}</p>}
              </div>
            </div>

            <div className={styles.textareaField}>
              <textarea rows="4" name="message" placeholder=" " value={formData.message} onChange={handleChange} ></textarea>
              <label>Message</label>
              {errors.message && <p className={styles.error}>{errors.message}</p>}
            </div>

            <div className={styles.toggleContainer}>
              <label className={styles.toggleSwitch}>
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span className={styles.slider}></span>
              </label>
              <span className={styles.toggleText}>
                By contacting us, you agree to our&nbsp;
                <a href="/terms" target="_blank">Terms of services</a> and&nbsp;
                <a href="/privacy" target="_blank">Privacy Policy</a>.
              </span>
              {errors.agree && <p className={styles.error}>{errors.agree}</p>}
            </div>

            {/* <button type="submit" className={styles.submitBtn}>
              Send Message
            </button> */}
            <button type="submit" className={styles.submitBtn} disabled={isSending}>
              {isSending ? (
                <span className={styles.spinner}></span>
              ) : (
                "Send Message"
              )}
            </button>

          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
