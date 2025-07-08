'use client';

import React from 'react';
import styles from './ClientReviewsSection.module.css';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

const ClientReviewsSection = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section id="reviews" className={styles.reviewsSection}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className={styles.heading}>What Our Clients Say</h3>

          <div className={styles.grid}>
            {reviews.map((review, index) => (
              <div key={index} className={styles.card}>
                <div className={styles.header}>
                  {review.image ? (
                    <img src={review.image} alt={review.name} />
                  ) : (
                    <div className={styles.avatarFallback}>{review.name[0]}</div>
                  )}
                  <div>
                    <h4>{review.name}</h4>
                    <div className={styles.stars}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar
                          key={i}
                          color={i < review.rating ? '#FF0000' : '#ddd'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className={styles.text}>“{review.review}”</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ClientReviewsSection;
