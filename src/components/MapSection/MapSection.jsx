"use client";
import React from "react";
import styles from "./MapSection.module.css";
import { FaMapMarkerAlt } from "react-icons/fa";

const MapSection = () => {
  return (
    <section className={styles.mapSection}>
      <div className="container">
        <div className={styles.mapWrapper}>
          <iframe
            className={styles.map}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.9080148124235!2d-73.98676672480579!3d40.744679337999084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259af3ef3514f%3A0x82439ab324dfc9a!2s71%20Madison%20Ave%2C%20New%20York%2C%20NY%2010016%2C%20USA!5e0!3m2!1sen!2sin!4v1622615949269!5m2!1sen!2sin"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Map"
          ></iframe>

          <div className={styles.mapOverlay}>
            <FaMapMarkerAlt className={styles.icon} />
            <h3>Our Office</h3>
            <p>71 Madison Ave, New York, NY 10013</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
