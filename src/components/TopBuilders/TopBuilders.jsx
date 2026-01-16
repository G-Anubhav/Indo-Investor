"use client";

import styles from "./TopBuilders.module.css";
import Image from "next/image";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import zxLogo from "@/images/builder-partners/zx.png";
import bhutaniLogo from "@/images/builder-partners/bhutani.png";
import sikkaLogo from "@/images/builder-partners/sikka.png";
import mirrikhLogo from "@/images/builder-partners/mirrikh.png";
import nestoriaLogo from "@/images/builder-partners/nestoria-group.png";
import saraswatiLogo from "@/images/builder-partners/saraswati.png";
import nimbusLogo from "@/images/builder-partners/nimbus.png";
import lodhaLogo from "@/images/builder-partners/lodha.png";

import "swiper/css";
import "swiper/css/autoplay";

// List of builder partners with valid URLs
const builders = [
  { name: "Zameen Xpert", src: zxLogo },
  { name: "Bhutani", src: bhutaniLogo },
  { name: "Nestoria", src: nestoriaLogo },
  { name: "Sikka", src: sikkaLogo },
  { name: "Mirrikh", src: mirrikhLogo },
  { name: "Saraswati", src: saraswatiLogo },
  { name: "Nimbus", src: nimbusLogo },
  { name: "Lodha", src: lodhaLogo },
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <SwiperSlide key={index} className={styles.slide}>
                <div className={styles.logoBox}>
                  <Image
                    src={builder.src}
                    alt={builder.name}
                    title={builder.name}
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
            </motion.div>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TopBuilders;
