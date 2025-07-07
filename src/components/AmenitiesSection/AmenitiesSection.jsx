"use client";

import styles from "./AmenitiesSection.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCar, faSwimmer, faShieldAlt, faStethoscope,
    faBook, faBed, faHome, faChild
} from "@fortawesome/free-solid-svg-icons";

const amenities = [
    { icon: faCar, title: "Parking Space", desc: "Enimad minim veniam quis no exercitation ullamco lab" },
    { icon: faSwimmer, title: "Swimming Pool", desc: "Enimad minim veniam quis no exercitation ullamco lab" },
    { icon: faShieldAlt, title: "Private Security", desc: "Enimad minim veniam quis no exercitation ullamco lab" },
    { icon: faStethoscope, title: "Medical Center", desc: "Enimad minim veniam quis no exercitation ullamco lab" },
    { icon: faBook, title: "Library Area", desc: "Enimad minim veniam quis no exercitation ullamco lab" },
    { icon: faBed, title: "King Size Beds", desc: "Enimad minim veniam quis no exercitation ullamco lab" },
    { icon: faHome, title: "Smart Homes", desc: "Enimad minim veniam quis no exercitation ullamco lab" },
    { icon: faChild, title: "Kid’s Playland", desc: "Enimad minim veniam quis no exercitation ullamco lab" },
];

const AmenitiesSection = () => {
    return (
        <section className={styles.amenitiesSection}>
            <div className="container">
                <div className={styles.labelWrapper}>
                    <span className={styles.label}>Amenities</span>
                </div>

                <h2 className={styles.heading}>Property Amenities</h2>

                <div className={styles.grid}>
                    {amenities.map((item, i) => (
                        <div key={i} className={styles.card}>
                            <div className={styles.iconWrapper}>
                                <FontAwesomeIcon icon={item.icon} className={styles.icon} />
                            </div>
                            <p className={styles.index}>{String(i + 1).padStart(2, "0")}</p>
                            <h5 className={styles.title}>{item.title}</h5>
                            <p className={styles.desc}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AmenitiesSection;
