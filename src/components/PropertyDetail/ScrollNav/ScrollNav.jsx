// 'use client';

// import React, { useEffect, useState } from 'react';
// import styles from './ScrollNav.module.css';

// const sections = [
//   { id: 'description', label: 'Description' },
//   { id: 'payment-plan', label: 'Payment Plan' },
//   { id: 'brochure', label: 'Brochure' },
//   { id: 'amenities', label: 'Amenities' },
//   { id: 'gallery', label: 'Gallery' },
//   { id: 'video', label: 'Video Tour' },
//   { id: 'location', label: 'Location' },
//   { id: 'developer', label: 'Developer' },
//   { id: 'reviews', label: 'Reviews' },
//   { id: 'faq', label: 'FAQs' },
// ];

// const ScrollNav = () => {
//   const [activeId, setActiveId] = useState('');

//   useEffect(() => {
//     const handleScroll = () => {
//       for (let i = 0; i < sections.length; i++) {
//         const section = document.getElementById(sections[i].id);
//         if (section) {
//           const offsetTop = section.offsetTop;
//           if (window.scrollY >= offsetTop - 120) {
//             setActiveId(sections[i].id);
//           }
//         }
//       }
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const scrollTo = (id) => {
//     const section = document.getElementById(id);
//     if (section) {
//       window.scrollTo({
//         top: section.offsetTop - 100,
//         behavior: 'smooth',
//       });
//     }
//   };

//   return (
//     <nav className={styles.scrollNav}>
//       <div className={`container ${styles.navInner}`}>
//         {sections.map((item) => (
//           <button
//             key={item.id}
//             onClick={() => scrollTo(item.id)}
//             className={`${styles.navItem} ${activeId === item.id ? styles.active : ''}`}
//           >
//             {item.label}
//           </button>
//         ))}
//       </div>
//     </nav>
//   );
// };

// export default ScrollNav;
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
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY;
      const progress = (scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-150px 0px -60% 0px',
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) observer.unobserve(element);
      });
      window.removeEventListener('scroll', handleScroll);
    };
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
      {/* Scroll progress bar */}
      <div
        className={styles.progressBar}
        style={{ width: `${scrollProgress}%` }}
      />
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
