"use client";
import React from "react";
import styles from "./AllProperties.module.css";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import residentialIcon from "@/images/property/residential.png";
import commercialIcon from "@/images/property/commercial.png";
import farmHouseIcon from "@/images/property/farm-house.png";
import flatIcon from "@/images/property/flat.png";
import simplexIcon from "@/images/property/simplex.png";
import duplexIcon from "@/images/property/duplex.png";
import villasIcon from "@/images/property/villas.png";
import officeSpaceIcon from "@/images/property/office-space.png";
import shopIcon from "@/images/property/shop.png";
import coworkingSpaceIcon from "@/images/property/coworking-space.png";

const focusData = [
    {
        icon: residentialIcon,
        title: "Residential",
        description: "Strategically located plots in the rapidly growing Jewar region, perfect for building your dream home or securing future growth.",
        linkText: "Explore Residential",
        href: "/properties/residential",
    },
    {
        icon: commercialIcon,
        title: "Commercial",
        description: "Premium commercial land parcels ideal for shops, offices, and showrooms in thriving investment zones.",
        linkText: "Explore Commercial",
        href: "/properties/commercial",
    },
    // {
    //     icon: farmHouseIcon,
    //     title: "Farm House",
    //     description: "Escape the city life with spacious farmhouse plots, ideal for weekend getaways or serene living.",
    //     linkText: "Explore Farm House",
    //     href: "/properties/farm-house",
    // },
    // {
    //     icon: flatIcon,
    //     title: "Flat",
    //     description: "Modern flats with functional layouts and smart amenities for comfortable urban living.",
    //     linkText: "Explore Flat",
    //     href: "/properties/flat",
    // },
    // {
    //     icon: simplexIcon,
    //     title: "Simplex",
    //     description: "Compact and elegant single-floor homes designed for simplicity, ease, and comfort.",
    //     linkText: "Explore Simplex",
    //     href: "/properties/simplex",
    // },
    // {
    //     icon: duplexIcon,
    //     title: "Duplex",
    //     description: "Stylishly designed dual-level homes offering more space, privacy, and premium features.",
    //     linkText: "Explore Duplex",
    //     href: "/properties/duplex",
    // },
    // {
    //     icon: villasIcon,
    //     title: "Villas",
    //     description: "Luxurious villas that combine sophistication, space, and an elevated living experience.",
    //     linkText: "Explore Villas",
    //     href: "/properties/villas",
    // },
    {
        icon: officeSpaceIcon,
        title: "Office Space",
        description: "Well-planned office spaces suited for startups, professionals, and growing businesses.",
        linkText: "Explore Office Space",
        href: "/properties/office-space",
    },
    // {
    //     icon: shopIcon,
    //     title: "Shop",
    //     description: "Retail spaces in high-visibility areas to help you attract customers and boost business.",
    //     linkText: "Explore Shop",
    //     href: "/properties/shop",
    // },
    {
        icon: coworkingSpaceIcon,
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
