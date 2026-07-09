"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./ProjectsSection.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRulerCombined,
  faMapMarkerAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import projectsData from "@/data/projectsData";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
  { key: "officeSpace", label: "Office Space" },
  { key: "coworking", label: "Co Working Space" },
];

const statusColors = {
  Available: "#28a745",
  Sold: "#dc3545",
  "Under Construction": "#dc8635",
  Upcoming: "#ffc107",
  "New Launch": "#007bff",
  "Ready to Move": "#e76d57",
  Exclusive: "#e1a140",
};

const ProjectsSection = () => {
  const [activeTab, setActiveTab] = useState("residential");
  const [searchTerm, setSearchTerm] = useState("");

  const projects = projectsData[activeTab] || [];
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProjects = projects.filter((project) => {
    const name = project.name?.toLowerCase() || "";
    const location = project.location?.toLowerCase() || "";
    return (
      name.includes(normalizedSearch) || location.includes(normalizedSearch)
    );
  });

  return (
    <section className={styles.section}>
      <div className="container text-center">
        <motion.h6
          className={styles.label}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Best Investment Opportunities
        </motion.h6>

        <motion.h2
          className={styles.heading}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          What Are You Looking For?
        </motion.h2>

        <div className={styles.tabs}>
          {categories.map(({ key, label }) => (
            <motion.button
              key={key}
              className={`${styles.tabButton} ${
                activeTab === key ? styles.active : ""
              }`}
              onClick={() => setActiveTab(key)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              {label}
            </motion.button>
          ))}
        </div>

        <div className={styles.searchInputContainer}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by project name or location..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className={styles.searchBox}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + searchTerm}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
          >
            {filteredProjects.length > 0 ? (
              <Swiper
                className={styles.projectsSlider}
                spaceBetween={24}
                slidesPerView={1}
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                loop={filteredProjects.length > 4}
                navigation={filteredProjects.length > 1}
                modules={[Autoplay, Navigation]}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 18 },
                  1024: { slidesPerView: 2, spaceBetween: 28 },
                  1280: { slidesPerView: 3, spaceBetween: 30 },
                }}
              >
                {filteredProjects.map((project, index) => (
                  <SwiperSlide
                    key={`${project.slug}-${index}`}
                    className={styles.slide}
                  >
                    <motion.div
                      className={styles.cardMotion}
                      whileHover={{ y: -5 }}
                    >
                      <Link
                        href={`/properties/${project.slug}`}
                        className={styles.cardlink}
                      >
                        <article className={styles.card}>
                          <div className={styles.imageWrapper}>
                            {Array.isArray(project.status) && (
                              <div className={styles.statusContainer}>
                                {project.status.map((status, statusIndex) => (
                                  <span
                                    key={statusIndex}
                                    className={styles.statusBadge}
                                    style={{
                                      backgroundColor:
                                        statusColors[status] || "#555",
                                    }}
                                  >
                                    {status}
                                  </span>
                                ))}
                              </div>
                            )}

                            <img
                              src={project.image?.src || project.image}
                              alt={project.name}
                            />
                            {project.badge && (
                              <span className={styles.badge}>
                                {Array.isArray(project.badge)
                                  ? project.badge.join(" ")
                                  : project.badge}
                              </span>
                            )}
                          </div>
                          <div className={styles.info}>
                            <h5>{project.name}</h5>
                            <div className={styles.infoItem}>
                              <FontAwesomeIcon icon={faRulerCombined} />
                              <span>{project.size}</span>
                            </div>
                            <div className={styles.infoItem}>
                              <FontAwesomeIcon icon={faMapMarkerAlt} />
                              <span>{project.location}</span>
                            </div>
                            <div className={styles.price}>{project.price}</div>
                            <span className={styles.viewDetails}>
                              View Details
                            </span>
                          </div>
                        </article>
                      </Link>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className={styles.emptyState}>
                No matching projects found. Try another project name or
                location.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ProjectsSection;
