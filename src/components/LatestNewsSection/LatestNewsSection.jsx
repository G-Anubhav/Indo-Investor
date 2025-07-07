"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import styles from "./LatestNewsSection.module.css";

const newsData = [
  {
    image: "/images/latest-news/news1.png",
    title: "The House of Abhinandan Lodha Brings Anjarle: The Goa of Tomorrow",
    date: "April 25, 2023",
    summary:
      "The House of Abhinandan Lodha, India’s largest branded land developer, launches its third and final project in Anjarle, Maharashtra...",
  },
  {
    image: "/images/latest-news/news1.png",
    title: "Urban Growth: New Projects Reshaping Real Estate",
    date: "June 20, 2023",
    summary:
      "From smart homes to futuristic cities, India's real estate market is evolving rapidly with a focus on sustainability and tech innovation...",
  },
  {
    image: "/images/latest-news/news1.png",
    title: "Real Estate Market Hits New Highs in 2025",
    date: "May 15, 2025",
    summary:
      "Experts reveal that the property sector has shown a significant boom post-pandemic due to increased urban migration and demand...",
  },
  {
    image: "/images/latest-news/news1.png",
    title: "Real Estate Market Hits New Highs in 2025",
    date: "May 15, 2025",
    summary:
      "Experts reveal that the property sector has shown a significant boom post-pandemic due to increased urban migration and demand...",
  },
];

const LatestNewsSection = () => {
  return (
    <section className={styles.latestNewsSection}>
      <div className="container">
        <p className={styles.sectionSubtitle}>LATEST NEWS</p>
        <h2 className={styles.sectionTitle}>News & Media</h2>

        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          autoplay={{ delay: 3000 }}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className={styles.swiperContainer}
          modules={[Autoplay, Pagination, Navigation]}
        >
          {newsData.map((item, index) => (
            <SwiperSlide key={index} className={styles.newsCard}>
              <img
                src={item.image}
                alt={item.title}
                className={styles.newsImage}
              />
              <div className={styles.newsContent}>
                <span className={styles.newsDate}>{item.date}</span>
                <h3 className={styles.newsTitle}>{item.title}</h3>
                <p className={styles.newsSummary}>{item.summary}</p>
                <button className={styles.viewDetails}>View Details</button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default LatestNewsSection;
