"use client";
import styles from './TestimonialSection.module.css';
import Image from 'next/image';
import { FaQuoteLeft } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const testimonials = [
  {
    name: "Jacob William",
    role: "SELLING AGENTS",
    image: "/images/testimonial/testimonial1.jpg",
    feedback: "Precious ipsum dolor sit amet consectetur adipisicing elit, sed dos mod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad min veniam, quis nostrud Precious ips um dolor sit amet, consecte",
  },
  {
    name: "Kelian Anderson",
    role: "SELLING AGENTS",
    image: "/images/testimonial/testimonial1.jpg",
    feedback: "Precious ipsum dolor sit amet consectetur adipisicing elit, sed dos mod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad min veniam, quis nostrud Precious ips um dolor sit amet, consecte",
  },
  {
    name: "Adam Joseph",
    role: "SELLING AGENTS",
    image: "/images/testimonial/testimonial1.jpg",
    feedback: "Precious ipsum dolor sit amet consectetur adipisicing elit, sed dos mod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad min veniam, quis nostrud Precious ips um dolor sit amet, consecte",
  },
  {
    name: "Adam Joseph",
    role: "SELLING AGENTS",
    image: "/images/testimonial/testimonial1.jpg",
    feedback: "Precious ipsum dolor sit amet consectetur adipisicing elit, sed dos mod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad min veniam, quis nostrud Precious ips um dolor sit amet, consecte",
  },
  {
    name: "Adam Joseph",
    role: "SELLING AGENTS",
    image: "/images/testimonial/testimonial1.jpg",
    feedback: "Precious ipsum dolor sit amet consectetur adipisicing elit, sed dos mod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad min veniam, quis nostrud Precious ips um dolor sit amet, consecte",
  },
  {
    name: "Adam Joseph",
    role: "SELLING AGENTS",
    image: "/images/testimonial/testimonial1.jpg",
    feedback: "Precious ipsum dolor sit amet consectetur adipisicing elit, sed dos mod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad min veniam, quis nostrud Precious ips um dolor sit amet, consecte",
  },
];

const TestimonialSection = () => {
  return (
    <section className={styles.testimonialSection}>
      <div className="container">
        <span className={styles.subtitle}>Our Testimonial</span>
        <h2 className={styles.title}>Clients Feedback</h2>

        <Swiper
          modules={[Pagination]}
          spaceBetween={30}
          pagination={{ clickable: true }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            0: { slidesPerView: 1 },
          }}
          className={styles.swiperContainer}
        >
          {testimonials.map((item, index) => (
            <SwiperSlide key={index}>
              <div className={styles.card}>
                <FaQuoteLeft className={styles.quoteIcon} />
                <p className={styles.feedback}>{item.feedback}</p>
                <div className={styles.clientInfo}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={50}
                    height={50}
                    className={styles.clientImage}
                  />
                  <div>
                    <h4 className={styles.clientName}>{item.name}</h4>
                    <p className={styles.clientRole}>{item.role}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialSection;
