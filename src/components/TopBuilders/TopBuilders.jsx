"use client";

import styles from "./TopBuilders.module.css";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import lodhaLogo from "@/images/builder-partners/lodha.png";
import krasaLogo from "@/images/builder-partners/lodha.png";
import godrejLogo from "@/images/builder-partners/lodha.png";
import fairfoxLogo from "@/images/builder-partners/lodha.png";
import bhutaniLogo from "@/images/builder-partners/lodha.png";


import "swiper/css";
import "swiper/css/autoplay";

// List of builder partners with valid URLs
const builders = [
  { name: "Krasa", src: krasaLogo },
  { name: "Godrej", src: godrejLogo },
  { name: "Fairfox", src: fairfoxLogo },
  { name: "Lodha", src: lodhaLogo },
  { name: "Bhutani", src: bhutaniLogo },
  { name: "Bhutani", src: bhutaniLogo },
  { name: "Bhutani", src: bhutaniLogo },
  { name: "Bhutani", src: bhutaniLogo },
];

const TopBuilders = () => {
  return (
    <section className={styles.section}>
      <div className="container text-center">
        <h6 className={styles.titleLine}>TOP BUILDERS</h6>
        <h2 className={styles.subtitle}>Meet from the best...</h2>

        <Swiper
          spaceBetween={20}
          slidesPerView={2}
          loop={true}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
          modules={[Autoplay]}
          className={styles.swiper}
        >
          {builders.map((builder, index) => (
            <SwiperSlide key={index} className={styles.slide}>
              <div className={styles.logoBox}>
                <Image
                  src={builder.src}
                  alt={builder.name}
                  width={150}
                  height={150}
                  className={styles.logo}
                  onError={(e) => {
                    e.target.src = "/default.png";
                    e.target.onerror = null;
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TopBuilders;
