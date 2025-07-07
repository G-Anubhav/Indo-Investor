"use client";

import styles from "./AboutSection.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faCamera, faGem, faShieldAlt } from "@fortawesome/free-solid-svg-icons";

const featureList = [
  { icon: faHome, title: "Smart Home Design" },
  { icon: faCamera, title: "Beautiful Scene Around" },
  { icon: faGem, title: "Exceptional Lifestyle" },
  { icon: faShieldAlt, title: "Complete 24/7 Security" },
];

const AboutSection = () => {
  return (
    <section className={styles.aboutSection}>
      <div className="container">
        <div className={styles.aboutWrapper}>
          {/* Left: Image Carousel */}
          <div className={styles.imageCarousel}>
            <Swiper
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={true}
              modules={[Autoplay]}
            >
              <SwiperSlide>
                <img src="/images/about/Aboutus1.jpg" alt="Room Interior 1" />
              </SwiperSlide>
              <SwiperSlide>
                <img src="/images/about/Aboutus1.jpg" alt="Room Interior 2" />
              </SwiperSlide>
            </Swiper>
          </div>

          {/* Right: Content */}
          <div className={styles.aboutContent}>
            <span className={styles.label}>About Us</span>
            <h2 className={styles.title}>
              The Leading Real Estate<br />
              Rental Marketplace<span className={styles.dot}>.</span>
            </h2>
            <p className={styles.desc}>
              Over 39,000 people work for us in more than 70 countries all over the world.
              This breadth of global coverage, combined with specialist services.
            </p>

            <div className={styles.featureGrid}>
              {featureList.map(({ icon, title }, i) => (
                <div key={i} className={styles.featureItem}>
                  <FontAwesomeIcon icon={icon} className={styles.icon} />
                  <span>{title}</span>
                </div>
              ))}
            </div>

            <div className={styles.noteBox}>
              Enimad minim veniam quis nostrud exercitation
              ullamco laboris. Lorem ipsum dolor sit amet.
            </div>

            <button className={styles.ctaButton}>OUR SERVICES</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
