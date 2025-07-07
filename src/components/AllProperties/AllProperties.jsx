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
        description: "Over 1 million+ homes for sale available on the website, we can match you with a house you will want to call home.",
        linkText: "Find A Home",
        href: "/buy-home",
    },
    {
        icon: buyIcon,
        title: "Commercial",
        description: "Over 1 million+ homes for sale available on the website, we can match you with a house you will want to call home.",
        linkText: "Find A Home",
        href: "/buy-home",
    },
    {
        icon: buyIcon,
        title: "Farm House",
        description: "Over 1 million+ homes for sale available on the website, we can match you with a house you will want to call home.",
        linkText: "Find A Home",
        href: "/buy-home",
    },
    {
        icon: rentIcon,
        title: "Flat",
        description: "Over 1 million+ homes for sale available on the website, we can match you with a house you will want to call home.",
        linkText: "Find A Home",
        href: "/rent-home",
    },
    {
        icon: rentIcon,
        title: "Simplex",
        description: "Over 1 million+ homes for sale available on the website, we can match you with a house you will want to call home.",
        linkText: "Find A Home",
        href: "/rent-home",
    },
    {
        icon: rentIcon,
        title: "Duplex",
        description: "Over 1 million+ homes for sale available on the website, we can match you with a house you will want to call home.",
        linkText: "Find A Home",
        href: "/rent-home",
    },
    {
        icon: sellIcon,
        title: "Villas",
        description: "Over 1 million+ homes for sale available on the website, we can match you with a house you will want to call home.",
        linkText: "Find A Home",
        href: "/sell-home",
    },
    {
        icon: sellIcon,
        title: "Office Space",
        description: "Over 1 million+ homes for sale available on the website, we can match you with a house you will want to call home.",
        linkText: "Find A Home",
        href: "/sell-home",
    },
    {
        icon: sellIcon,
        title: "Shop",
        description: "Over 1 million+ homes for sale available on the website, we can match you with a house you will want to call home.",
        linkText: "Find A Home",
        href: "/sell-home",
    },
    {
        icon: sellIcon,
        title: "Co-working Space",
        description: "Over 1 million+ homes for sale available on the website, we can match you with a house you will want to call home.",
        linkText: "Find A Home",
        href: "/sell-home",
    },
];

const AllProperties = () => {
    return (
        <section className={styles.AllPropertiesSection}>
            <div className="container">
                <span className={styles.subtitle}>Our Services</span>
                <h2 className={styles.title}>Our Main Focus</h2>

                <div className={styles.cardWrapper}>
                    {focusData.map((item, index) => (
                        <motion.div
                            className={styles.card}
                            key={index}
                            whileHover={{ y: -6, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)" }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
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
