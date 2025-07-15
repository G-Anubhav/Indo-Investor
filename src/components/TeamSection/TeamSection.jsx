
"use client";

import styles from "./TeamSection.module.css";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import { motion } from "framer-motion";

const teamData = [
  {
    name: "Anjali Sharma",
    role: "Founder & CEO",
    image: "/images/testimonial/testimonial1.jpg",
    socials: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
    },
  },
  {
    name: "Ravi Verma",
    role: "Head of Sales",
    image: "/images/testimonial/testimonial1.jpg",
    socials: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
    },
  },
  {
    name: "Simran Kaur",
    role: "Marketing Lead",
    image: "/images/testimonial/testimonial1.jpg",
    socials: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
    },
  },
  {
    name: "Simran Kaur",
    role: "Marketing Lead",
    image: "/images/testimonial/testimonial1.jpg",
    socials: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
    },
  },
];

const TeamSection = () => {
  return (
    <section className={styles.teamSection} id="ourTeam">
      <div className="container text-center">
        <motion.h6
          className={styles.subheading}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          PROFESSIONALS YOU CAN TRUST
        </motion.h6>
        <motion.h2
          className={styles.heading}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Meet Our Creative Team
        </motion.h2>
        <motion.p
          className={styles.description}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Guided by seasoned founders and powered by a dedicated team of real estate consultants, legal experts, and customer support professionals, we work tirelessly to make your investment journey smooth, informed, and truly rewarding.
        </motion.p>

        <div className={styles.teamGrid}>
          {teamData.map((member, idx) => (
            <motion.div
              key={idx}
              className={styles.card}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
            >
              <div className={styles.imageWrapper}>
                <img src={member.image} alt={member.name} />
                <div className={styles.overlay}>
                  <a href={member.socials.facebook} target="_blank" rel="noreferrer">
                    <FaFacebookF />
                  </a>
                  <a href={member.socials.twitter} target="_blank" rel="noreferrer">
                    <FaTwitter />
                  </a>
                  <a href={member.socials.linkedin} target="_blank" rel="noreferrer">
                    <FaLinkedinIn />
                  </a>
                </div>
              </div>
              <div className={styles.info}>
                <h4>{member.name}</h4>
                <p>{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
