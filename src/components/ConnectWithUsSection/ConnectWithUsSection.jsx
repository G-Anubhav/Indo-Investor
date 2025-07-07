"use client";
import React from "react";
import Link from "next/link";
import styles from "./ConnectWithUsSection.module.css";
import { FaWhatsapp, FaVideo, FaArrowRight } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { motion } from "framer-motion";

const connectItems = [
    {
        title: "Connect On",
        platform: "WhatsApp",
        icon: <FaWhatsapp />,
        buttonText: "Connect",
        link: "https://wa.me/1234567890",
        color: "#25D366",
    },
    {
        title: "Book an",
        platform: "Appointment",
        icon: <MdLocationOn />,
        buttonText: "Book",
        link: "https://example.com/book-appointment",
        color: "#FF3B30",
    },
    {
        title: "Schedule a",
        platform: "Video Call",
        icon: <FaVideo />,
        buttonText: "Schedule",
        link: "https://example.com/schedule-video-call",
        color: "#007BFF",
    },
];

const ConnectWithUsSection = () => {
    return (
        <section className={styles.connectSection}>
            <div className="container">
                <div className={styles.headingWrapper}>
                    <span className={styles.subheading}>WE ARE AVAILABLE 24X7 TO HELP YOU</span>
                    <h2 className={styles.heading}>Connect With Us</h2>
                </div>
                <div className={styles.cardWrapper}>
                    {connectItems.map((item, index) => (
                        <motion.div
                            key={index}
                            className={styles.card}
                            whileHover={{ y: -10, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.2 }}
                            viewport={{ once: true }}
                        >
                            <div className={styles.text}>
                                <h5 className={styles.title}>{item.title}</h5>
                                <h3 className={styles.platform}>{item.platform}</h3>
                                <Link
                                    href={item.link}
                                    className={styles.button}
                                    style={{ backgroundColor: item.color }}
                                >
                                    {item.buttonText}
                                    <span className={styles.arrow}><FaArrowRight /></span>
                                </Link>

                            </div>
                            <div
                                className={styles.icon}
                                style={{ color: item.color }}
                            >
                                {item.icon}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ConnectWithUsSection;
