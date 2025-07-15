"use client";
import React from "react";
import styles from "./MapSection.module.css";
import { FaMapMarkerAlt } from "react-icons/fa";

const MapSection = () => {
  return (
    <section className={styles.mapSection} id="officemap">
      <div className="container">
        <div className={styles.mapWrapper}>
          <iframe
            className={styles.map}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.0257685057873!2d77.38144907416842!3d28.62898978424397!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ceff9f50d60f5%3A0x5329eae568c4afe5!2sD%20242%2C%20Sector%2063%20Rd%2C%20D%20Block%2C%20Sector%2063%2C%20Noida%2C%20Uttar%20Pradesh%20201301!5e0!3m2!1sen!2sin!4v1752560530277!5m2!1sen!2sin"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Map"
          ></iframe>
          <div className={styles.mobileInfo}>
            <FaMapMarkerAlt className={styles.mobileIcon} />
            <div>
              <h4>Our Office</h4>
              <p>F-16, Block D-242, Sector 63, Noida, Uttar Pradesh 201301</p>
            </div>
          </div>

          <div className={styles.mapOverlay}>
            <FaMapMarkerAlt className={styles.icon} />
            <h3>Our Office</h3>
            <p>F-16, Block D-242, Sector 63, Noida, Uttar Pradesh 201301</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
