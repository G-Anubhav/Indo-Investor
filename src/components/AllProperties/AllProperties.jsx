"use client";
import React from "react";
import styles from "./AllProperties.module.css";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import buyIcon from "@/images/property/plot1.png";
import rentIcon from "@/images/property/plot1.png";
import sellIcon from "@/images/property/plot1.png";

const focusData = [
    {
        icon: buyIcon,
        title: "Residential",
        description: "Strategically located plots in the rapidly growing Jewar region, perfect for building your dream home or securing future growth.",
        linkText: "Explore Residential",
        href: "/properties/residential",
    },
    {
        icon: buyIcon,
        title: "Commercial",
        description: "Premium commercial land parcels ideal for shops, offices, and showrooms in thriving investment zones.",
        linkText: "Explore Commercial",
        href: "/properties/commercial",
    },
    {
        icon: buyIcon,
        title: "Farm House",
        description: "Escape the city life with spacious farmhouse plots, ideal for weekend getaways or serene living.",
        linkText: "Explore Farm House",
        href: "/properties/farm-house",
    },
    {
        icon: rentIcon,
        title: "Flat",
        description: "Modern flats with functional layouts and smart amenities for comfortable urban living.",
        linkText: "Explore Flat",
        href: "/properties/flat",
    },
    {
        icon: rentIcon,
        title: "Simplex",
        description: "Compact and elegant single-floor homes designed for simplicity, ease, and comfort.",
        linkText: "Explore Simplex",
        href: "/properties/simplex",
    },
    {
        icon: rentIcon,
        title: "Duplex",
        description: "Stylishly designed dual-level homes offering more space, privacy, and premium features.",
        linkText: "Explore Duplex",
        href: "/properties/duplex",
    },
    {
        icon: sellIcon,
        title: "Villas",
        description: "Luxurious villas that combine sophistication, space, and an elevated living experience.",
        linkText: "Explore Villas",
        href: "/properties/villas",
    },
    {
        icon: sellIcon,
        title: "Office Space",
        description: "Well-planned office spaces suited for startups, professionals, and growing businesses.",
        linkText: "Explore Office Space",
        href: "/office-space",
    },
    {
        icon: sellIcon,
        title: "Shop",
        description: "Retail spaces in high-visibility areas to help you attract customers and boost business.",
        linkText: "Explore Shop",
        href: "/properties/shop",
    },
    {
        icon: sellIcon,
        title: "Co-working Space",
        description: "Flexible, shared workspaces built for collaboration, creativity, and productivity.",
        linkText: "Explore Coworking Space",
        href: "/properties/coworking-space",
    },
];

const AllProperties = () => {
    return (
        <section className={styles.AllPropertiesSection} id="servicesection">
            <div className="container">
                <span className={styles.subtitle}>Our Services</span>
                <h2 className={styles.title}>Our Main Focus</h2>

                <div className={styles.cardWrapper}>
                    {focusData.map((item, index) => (
                        <motion.div
                            className={styles.card}
                            key={index}
                            whileHover={{ y: -6, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)" }}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >

                            <div className={styles.iconBox}>
                                <Image src={item.icon} alt={item.title} />
                            </div>
                            <h3 className={styles.cardTitle}>
                                <Link href={item.href}>{item.title}</Link>
                            </h3>
                            <p className={styles.cardDesc}>{item.description}</p>
                            <Link href={item.href} className={styles.link}>
                                {item.linkText}
                                <FontAwesomeIcon icon={faArrowRight} className={styles.arrowIcon} />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AllProperties;
