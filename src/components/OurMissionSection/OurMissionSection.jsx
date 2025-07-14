"use client";

import styles from "./OurMissionSection.module.css";
import Image from "next/image";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faHandshake, faChartLine, faUserCheck, faAward, faLightbulb } from "@fortawesome/free-solid-svg-icons";

const missionPoints = [
  {
    icon: faHandshake,
    title: "Integrity",
    desc: "We uphold honesty and transparency in every dealing."
  },
  {
    icon: faUserCheck,
    title: "Customer First",
    desc: "Your satisfaction, trust, and financial security are our top priorities."
  },
  {
    icon: faAward,
    title: "Excellence",
    desc: "We aim to exceed expectations with every project we take on."
  },
  {
    icon: faLightbulb,
    title: "Innovation",
    desc: "Bringing modern, tech-enabled solutions to traditional investments for a smarter.",
  },
];

const OurMissionSection = () => {
  return (
    <section className={styles.missionSection}>
      <div className="container">
        <div className={styles.wrapper}>
          {/* Left: Image */}
          <div className={styles.imageWrapper}>
            <Image
              src="/images/mission/mission.jpg"
              alt="Team working on real estate mission"
              width={600}
              height={400}
              className={styles.missionImage}
            />
          </div>

          {/* Right: Content */}
          <div className={styles.content}>
            <span className={styles.label}>Our Values</span>
            <h2 className={styles.heading}>
              Building Every Investment with <span>Strong Principles</span>
            </h2>

            <div className={styles.pointsGrid}>
              {missionPoints.map(({ icon, title, desc }, index) => (
                <motion.div
                  className={styles.pointCard}
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <FontAwesomeIcon icon={icon} className={styles.icon} />
                  <h5>{title}</h5>
                  <p>{desc}</p>
                </motion.div>
              ))}
            </div>

            {/* <button className={styles.ctaButton}>Learn More</button> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurMissionSection;
