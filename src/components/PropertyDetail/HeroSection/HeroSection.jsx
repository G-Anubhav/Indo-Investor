"use client";
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import styles from './HeroSection.module.css';
import { FaMapMarkerAlt, FaRupeeSign, FaStar, FaCheckCircle, FaHome } from 'react-icons/fa';

const HeroSection = ({ data }) => {
  const {
    name,
    location,
    price,
    rating,
    reviewCount,
    perUnit,
    status,
    size,
    configurations,
    forSale,
    images = [],
  } = data;

  return (
    <section className={styles.heroSection}>
    <div className="container">
        <div className={styles.carousel}>
            <Swiper
            spaceBetween={10}
            navigation
            loop
            autoplay={{ delay: 3000 }}
            modules={[Autoplay, Navigation]}
            >
            {images.map((img, index) => (
                <SwiperSlide key={index}>
                <img src={img} alt={`property-image-${index}`} className={styles.image} />
                </SwiperSlide>
            ))}
            </Swiper>
        </div>

        <div className={styles.infoPanel}>
            <h1 className={styles.title}>{name}</h1>

            <p className={styles.location}>
            <FaMapMarkerAlt /> {location}
            </p>

            <p className={styles.price}>
            <FaRupeeSign /> {price}
            </p>

            <div className={styles.area}>
            Area: <strong>{perUnit}</strong>
            </div>

            <div className={styles.ratings}>
            {Array.from({ length: 5 }).map((_, i) => (
                <FaStar
                key={i}
                color={i < rating ? '#FFD700' : '#ccc'}
                className={styles.star}
                />
            ))}
            <span className={styles.reviewCount}>({reviewCount} reviews)</span>
            </div>

            {/* Feature Boxes */}
            <div className={styles.features}>
            <div className={styles.featureBox}>
                <span className={styles.featureLabel}>Status</span>
                <span className={styles.featureValue}>{status}</span>
            </div>
            <div className={styles.featureBox}>
                <span className={styles.featureLabel}>Size</span>
                <span className={styles.featureValue}>{size}</span>
            </div>
            <div className={styles.featureBox}>
                <span className={styles.featureLabel}>Config</span>
                <span className={styles.featureValue}>{configurations}</span>
            </div>
            <div className={styles.featureBox}>
                <span className={styles.featureLabel}>Available</span>
                <span className={styles.featureValue}>
                {forSale ? (
                    <span className={styles.available}><FaCheckCircle /> For Sale</span>
                ) : (
                    <span className={styles.sold}>Sold Out</span>
                )}
                </span>
            </div>
            </div>
        </div>
      </div>  
    </section>
  );
};

export default HeroSection;
