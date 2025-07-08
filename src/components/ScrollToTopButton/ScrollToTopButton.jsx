'use client';

import React, { useEffect, useState } from 'react';
import styles from './ScrollToTopButton.module.css';
import { FaArrowCircleUp } from 'react-icons/fa';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return isVisible ? (
    <div className={styles.wrapper} onClick={scrollToTop}>
      <div className={styles.buttonWrapper}>
        <FaArrowCircleUp className={styles.icon} />
        <span className={styles.tooltip}>Back to top</span>
      </div>
    </div>
  ) : null;
};

export default ScrollToTopButton;
