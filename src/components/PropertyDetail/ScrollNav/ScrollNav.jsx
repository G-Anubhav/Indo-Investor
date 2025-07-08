'use client';

import React, { useEffect, useState } from 'react';
import styles from './ScrollNav.module.css';

const sections = [
  { id: 'description', label: 'Description' },
  { id: 'payment-plan', label: 'Payment Plan' },
  { id: 'brochure', label: 'Brochure' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'video', label: 'Video Tour' },
  { id: 'location', label: 'Location' },
  { id: 'developer', label: 'Developer' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faq', label: 'FAQs' },
];

const ScrollNav = () => {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      for (let i = 0; i < sections.length; i++) {
        const section = document.getElementById(sections[i].id);
        if (section) {
          const offsetTop = section.offsetTop;
          if (window.scrollY >= offsetTop - 120) {
            setActiveId(sections[i].id);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const section = document.getElementById(id);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 100,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav className={styles.scrollNav}>
      <div className={`container ${styles.navInner}`}>
        {sections.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={`${styles.navItem} ${activeId === item.id ? styles.active : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default ScrollNav;
