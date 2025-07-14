"use client";

import styles from "./AboutSection.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faCamera, faGem, faShieldAlt, faUserTie } from "@fortawesome/free-solid-svg-icons";

const featureList = [
  { icon: faGem, title: "Verified Investment Deals" },
  { icon: faHome, title: "Prime Growth Locations" },
  { icon: faUserTie, title: "Expert Guidance & Support" },
  { icon: faShieldAlt, title: "100% Trusted Processes" },
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
              Investing with Indo Investors:
              Turning Dreams into Assets<span className={styles.dot}>.</span>
            </h2>
            <p className={styles.desc}>
              At Indo Investors, we believe investing in land and property is far more than just a transaction — it’s a journey towards building a secure, prosperous future for you and your family.
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
              Founded with a clear vision to make real estate investment simple, transparent, and genuinely rewarding for every Indian, we have grown into a name synonymous with trust and growth.
            </div>

            {/* <button className={styles.ctaButton}>OUR SERVICES</button> */}
            <a href="#servicesection" className={styles.ctaButton}>
              OUR SERVICES
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
