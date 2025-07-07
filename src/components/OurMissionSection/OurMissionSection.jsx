"use client";

import styles from "./OurMissionSection.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faHandshake, faChartLine } from "@fortawesome/free-solid-svg-icons";

const missionPoints = [
  {
    icon: faGlobe,
    title: "Global Vision",
    desc: "We connect people with property across the globe, helping you make sound real estate investments."
  },
  {
    icon: faHandshake,
    title: "Client Commitment",
    desc: "We value trust, transparency, and long-term partnerships with every client we serve."
  },
  {
    icon: faChartLine,
    title: "Sustainable Growth",
    desc: "Focused on innovation and eco-friendly spaces for better living and investment returns."
  },
  {
    icon: faChartLine,
    title: "Sustainable Growth",
    desc: "Focused on innovation and eco-friendly spaces for better living and investment returns."
  }
];

const OurMissionSection = () => {
  return (
    <section className={styles.missionSection}>
      <div className="container">
        <div className={styles.wrapper}>
          {/* Left: Image */}
          <div className={styles.imageWrapper}>
            <img src="/images/mission/mission.jpg" alt="Our Mission" />
          </div>

          {/* Right: Content */}
          <div className={styles.content}>
            <span className={styles.label}>Our Mission</span>
            <h2 className={styles.heading}>
              Driving <span>Real Estate Excellence</span> with Purpose
            </h2>

            <div className={styles.pointsGrid}>
              {missionPoints.map(({ icon, title, desc }, index) => (
                <div key={index} className={styles.pointCard}>
                  <FontAwesomeIcon icon={icon} className={styles.icon} />
                  <h5>{title}</h5>
                  <p>{desc}</p>
                </div>
              ))}
            </div>

            <button className={styles.ctaButton}>Learn More</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurMissionSection;
