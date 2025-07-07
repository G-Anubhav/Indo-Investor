"use client";
import React, { useEffect, useState } from "react";
import styles from "./PropertySection.module.css";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    FaSearchLocation,
    FaMapMarkerAlt,
    FaBuilding,
    FaStar,
    FaStarHalfAlt,
    FaRegStar,
} from "react-icons/fa";

const PropertySection = ({ category, title, data = [] }) => {
    // const [filteredData, setFilteredData] = useState([]);
    const [filteredData, setFilteredData] = useState(Array.isArray(data) ? data : []);
    const [search, setSearch] = useState("");
    const [locationFilter, setLocationFilter] = useState("");

    // Ensure locations are unique
    const locations = [...new Set(data?.map((item) => item.location))];

    useEffect(() => {
        const searchTerm = search.trim().toLowerCase();
        console.log("PROPERTY DATA:", data);
        const filtered = data.filter((item) => {
            const titleMatch = (item?.name || "").toLowerCase().includes(searchTerm);
            const locationMatch = locationFilter === "" || item?.location === locationFilter;
            return titleMatch && locationMatch;
        });

        setFilteredData(filtered);
    }, [search, locationFilter, data]);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <motion.span
                    key={`full-${i}`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <FaStar color="#ffc107" />
                </motion.span>
            );
        }

        if (hasHalfStar) {
            stars.push(
                <motion.span
                    key="half"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: fullStars * 0.1 }}
                >
                    <FaStarHalfAlt color="#ffc107" />
                </motion.span>
            );
        }

        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <motion.span
                    key={`empty-${i}`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (fullStars + (hasHalfStar ? 1 : 0) + i) * 0.1 }}
                >
                    <FaRegStar color="#ccc" />
                </motion.span>
            );
        }

        return stars;
    };

    return (
        <section className={styles.propertySection}>
            <div className="container">
                {/* Heading */}
                <div className={styles.headingWrapper}>
                    <h5 className={styles.subheading}>
                        <FaSearchLocation className={styles.icon} />
                        Explore Properties
                    </h5>
                    <h2 className={styles.title}>{title}</h2>
                </div>

                {/* Filters */}
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search property by name..."
                        value={search}
                        onChange={(e) => {
                            console.log("Search input:", e.target.value);
                            setSearch(e.target.value);
                        }}

                        className={styles.searchInput}
                    />
                    <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className={styles.select}
                    >
                        <option value="">All Locations</option>
                        {locations.map((loc) => (
                            <option key={loc} value={loc}>
                                {loc}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Cards */}
                <div className={styles.grid}>
                    {Array.isArray(filteredData) && filteredData.length > 0 ? (
                        // filteredData.map((item) => (
                        //     <Link href={`/properties/${category}/${item.slug}`} key={item.id}>
                        //         <motion.div
                        //             className={styles.card}
                        //             whileHover={{ scale: 1.03 }}
                        //             transition={{ duration: 0.3 }}
                        //         >
                        //             <div className={styles.imageWrapper}>
                        //                 <img src={item.image} alt={item.title} />
                        //                 {item.newLaunch && (
                        //                     <span className={styles.badge}>New Launch</span>
                        //                 )}
                        //             </div>
                        //             <div className={styles.cardContent}>
                        //                 <h4 className={styles.name}>{item.name}</h4>
                        //                 <p className={styles.price}>{item.price}</p>
                        //                 <div className={styles.rating}>{renderStars(Number(item.rating) || 0)}</div>
                        //                 <p className={styles.area}>
                        //                     <FaBuilding /> {item.area}
                        //                 </p>
                        //                 <p className={styles.location}>
                        //                     <FaMapMarkerAlt /> {item.location}
                        //                 </p>
                        //             </div>
                        //         </motion.div>
                        //     </Link>
                        // ))
                        <AnimatePresence mode="wait">
                            {filteredData.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    className={styles.card}
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Link href={`/properties/${category}/${item.slug}`} className={styles.linkContent}>
                                        <div className={styles.imageWrapper}>
                                            <img src={item.image} alt={item.name} />
                                            {item.newLaunch && <span className={styles.badge}>New Launch</span>}
                                        </div>
                                        <div className={styles.cardContent}>
                                            <h4 className={styles.name}>{item.name}</h4>
                                            <p className={styles.location}><FaMapMarkerAlt /> {item.location}</p>
                                            <p className={styles.area}><FaBuilding /> {item.area}</p>
                                            <div className={styles.rating}>{renderStars(Number(item.rating) || 0)}</div>
                                            <div className={styles.divider}></div>
                                            <p className={styles.price}>{item.price}</p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <p className={styles.noData}>No properties found.</p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default PropertySection;
