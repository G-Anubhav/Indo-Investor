'use client';

import React, { useState } from 'react';
import styles from './QASection.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const QASection = ({ questions }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  if (!questions || questions.length === 0) return null;

  const toggleIndex = (index) =>
    setActiveIndex((prev) => (prev === index ? null : index));

  return (
    <section id="faq" className={styles.qaSection}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.heading}>Frequently Asked Questions</h2>
          <div className={styles.accordion}>
            {questions.map((item, index) => (
              <div className={styles.card} key={index}>
                <button
                  className={styles.question}
                  onClick={() => toggleIndex(index)}
                >
                  <span>{item.question}</span>
                  {activeIndex === index ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </button>

                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      className={styles.answer}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default QASection;
