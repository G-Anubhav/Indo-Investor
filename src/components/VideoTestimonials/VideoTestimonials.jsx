"use client";
import React, { useState } from "react";
import styles from "./VideoTestimonials.module.css";

const testimonials = [
  {
    id: 1,
    name: "Mr Juneja",
    text: "Indo Real Estate made my dream home a reality. Their professionalism and support were outstanding.",
    videoUrl: "/videos/testimonial/client1.mp4",
    thumbnail: "/videos/testimonial/client1img.png",
  },
  {
    id: 2,
    name: "Rahul Singh",
    text: "The entire process was smooth and transparent. Highly recommended!",
    videoUrl: "/videos/testimonial/client1.mp4",
    thumbnail: "/videos/testimonial/client1img.png",
  },
  {
    id: 3,
    name: "Amit Verma",
    text: "Their expertise in real estate investment is unmatched.",
    videoUrl: "/videos/testimonial/client1.mp4",
    thumbnail: "/videos/testimonial/client1img.png",
  },
];

export default function VideoTestimonials() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <section className={styles.videoTestimonials}>
        <span className={styles.subtitle}>Live Testimonial</span>
        <h2 className={styles.title}>Videos Feedbacks Straight from Clients</h2>
      <div className={styles.testimonialGrid}>
        {testimonials.map((t) => (
          <div
            key={t.id}
            className={styles.testimonialCard}
            onClick={() => setSelectedVideo(t.videoUrl)}
          >
            <div className={styles.thumbnailWrapper}>
              <img
                src={t.thumbnail}
                alt={`${t.name} testimonial`}
                className={styles.thumbnail}
              />
              <div className={styles.playButton}>▶</div>
            </div>
            <div className={styles.testimonialContent}>
              <h3>{t.name}</h3>
              <p>{t.text}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <div className={styles.videoPopup} onClick={() => setSelectedVideo(null)}>
          <div
            className={styles.videoContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={selectedVideo}
              controls
              autoPlay
              className={styles.videoPlayer}
            />
          </div>
        </div>
      )}
    </section>
  );
}
