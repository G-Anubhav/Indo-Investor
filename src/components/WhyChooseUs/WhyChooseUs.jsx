"use client";
import React from "react";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import {
    FaCalendarAlt,
    FaSmile,
    FaUserTie,
    FaBullseye,
    FaMoneyBillWave,
    FaClock,
    FaHandshake,
} from "react-icons/fa";
import styles from "./WhyChooseUs.module.css";

const stats = [
    { icon: <FaCalendarAlt />, label: "Years of Experience", value: 16 },
    { icon: <FaSmile />, label: "Happy Customers", value: 25500 },
    { icon: <FaUserTie />, label: "Real Estate Agents", value: 500 },
];

const features = [
    {
        icon: <FaBullseye />,
        title: "Personalized Service",
        description:
            "Trust us for personalized service that goes the extra mile to exceed your expectations.",
        bgColor: "#222",
        textColor: "#fff",
    },
    {
        icon: <FaMoneyBillWave />,
        title: "Best Deals & Easy Financing",
        description:
            "Your gateway to the best real estate deals and easy financing options.",
        bgColor: "#0dcaf0",
        textColor: "#000",
    },
    {
        icon: <FaClock />,
        title: "Round-the-Clock Support",
        description:
            "We provide 24/7 support because real estate decisions can’t wait.",
        bgColor: "#ffc107",
        textColor: "#000",
    },
    {
        icon: <FaHandshake />,
        title: "Trusted for Delivering the Best",
        description:
            "With our commitment to excellence, we’ve earned a reputation for exceeding expectations.",
        bgColor: "#f4745d",
        textColor: "#fff",
    },
];

const WhyChooseUs = () => {
    return (
        <section className={styles.whyChooseUs}>
            <div className="container">
                {/* Titles */}
                <motion.h6
                    className={styles.subTitle}
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    Why Choose Us
                </motion.h6>

                <motion.h2
                    className={styles.mainTitle}
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Your Trusted Real Estate Partner
                </motion.h2>

                <motion.p
                    className={styles.description}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    With over a decade of experience and a customer-centric approach, we
                    provide unmatched real estate services.
                </motion.p>

                {/* Counters */}
                <div className={styles.stats}>
                    {stats.map((item, idx) => (
                        <motion.div
                            className={styles.statCard}
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.2 }}
                            whileHover={{ y: -14 }}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            <h3>
                                <CountUp end={item.value} duration={2} separator="," />
                            </h3>
                            <p>{item.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Features */}
                <div className={styles.features}>
                    {features.map((feature, index) => (
                        <motion.div
                            className={styles.featureCard}
                            key={index}
                            style={{
                                backgroundColor: feature.bgColor,
                                color: feature.textColor,
                            }}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 * index }}
                            whileHover={{ y: -12 }}
                        >
                            {/* <span className={styles.featureIcon}>{feature.icon}</span> */}
                            <div className={styles.iconWrapper}>
                                {feature.icon}
                            </div>
                            <h4>{feature.title}</h4>
                            <p>{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
