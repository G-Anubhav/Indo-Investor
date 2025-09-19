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
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.152450002053!2d77.37360349678956!3d28.625192700000007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5a79fcba149%3A0x2be658accdf6761b!2sSector%2063%2C%20H-Block!5e0!3m2!1sen!2sin!4v1758307515079!5m2!1sen!2sin"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Map"
          ></iframe>
          <div className={styles.mobileInfo}>
            <FaMapMarkerAlt className={styles.mobileIcon} />
            <div>
              <h4>Our Office</h4>
              <p>H-169, 1st Floor, Office No. F-04 Sector-63, Noida, U.P. 201301</p>
            </div>
          </div>

          <div className={styles.mapOverlay}>
            <FaMapMarkerAlt className={styles.icon} />
            <h3>Our Office</h3>
            <p>H-169, 1st Floor, Office No. F-04 Sector-63, Noida, U.P. 201301</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
