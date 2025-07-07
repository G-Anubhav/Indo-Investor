"use client";
import React, { useState } from "react";
import styles from "./JobOpeningsSection.module.css";
import { motion } from "framer-motion";
import { FaArrowRight, FaTimes } from "react-icons/fa";
import JobModal from "../JobModal/JobModal";
import { jobData } from "@/data/jobData";

const JobOpeningsSection = () => {
    const categories = Object.keys(jobData);
    const [selectedCategory, setSelectedCategory] = useState(categories[0]);
    const [selectedJob, setSelectedJob] = useState(null);

    //   const closeModal = () => setSelectedJob(null);

    return (
        <section className={styles.jobSection} id="jobOpens">
            <div className="container">
                <div className={styles.headingWrapper}>
                    <span className={styles.subheading}>Explore Exciting Career Opportunities</span>
                    <h2 className={styles.heading}>Build Your Career With Us</h2>
                </div>
                <div className={styles.jobWrapper}>
                    {/* Sidebar */}
                    <aside className={styles.sidebar}>
                        <h3>Current Openings</h3>
                        <ul>
                            {categories.map((category) => (
                                <li
                                    key={category}
                                    className={selectedCategory === category ? styles.active : ""}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category} ({jobData[category].length})
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* Job Cards */}
                    <div className={styles.jobs}>
                        <h3>Jobs in {selectedCategory}</h3>
                        {jobData[selectedCategory].length > 0 ? (
                            jobData[selectedCategory].map((job) => (
                                <motion.div
                                    key={job.id}
                                    className={styles.jobCard}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className={styles.jobInfo}>
                                        <h4>
                                            Job Title: <span className={styles.highlight}>{job.title}</span>
                                        </h4>
                                        <p>
                                            Experience: {job.experience} years | Location: {job.location}
                                        </p>
                                        <span className={styles.tag}>{job.tag}</span>
                                    </div>
                                    <button
                                        className={styles.button}
                                        onClick={() => setSelectedJob(job)}
                                    >
                                        Know More <FaArrowRight className={styles.icon} />
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <p className={styles.noJobs}>No openings in this category currently.</p>
                        )}
                    </div>
                </div>
            </div>

            {selectedJob && (
                <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
            )}
        </section>
    );
};

export default JobOpeningsSection;
