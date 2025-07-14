"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "./HeroBanner.module.css";

import banner1 from "@/images/banner/slider1.jpg";
import banner2 from "@/images/banner/slider2.jpg";
import banner3 from "@/images/banner/slider3.jpg";
import banner4 from "@/images/banner/slider4.jpg";

const bannerData = [
  { image: banner1, title: "Experience Luxury With", subtitle: "INDO INVESTOR INFRA" },
  { image: banner2, title: "Find Your Dream Home", subtitle: "WITH CONFIDENCE" },
  { image: banner3, title: "Prime Locations Await", subtitle: "BOOK TODAY" },
  { image: banner4, title: "Redefining Realty", subtitle: "WITH INTEGRITY" },
];

const HeroBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [city, setCity] = useState("Gurugram");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % bannerData.length);
        setFade(true);
      }, 300); // match CSS fade duration
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching:", { city, query });

    // Example: redirect to search results page
    // router.push(`/search?city=${city}&q=${query}`);
  };

  const { image, title, subtitle } = bannerData[currentIndex];

  return (
    <div className={styles.hero}>
      {bannerData.map((banner, i) => (
        <div
          key={i}
          className={`${styles.imageWrapper} ${i === currentIndex ? styles.active : ""}`}
        >
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            style={{ objectFit: "cover" }}
            priority={i === 0}
          />
        </div>
      ))}

      <div className={styles.overlay}>
        <div className={styles.content}>
          <h4>{bannerData[currentIndex].title}</h4>
          <h1>{bannerData[currentIndex].subtitle}</h1>

          <form className={styles.searchBar} onSubmit={handleSearch}>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={styles.select}
            >
              <option>Gurugram</option>
              <option>Noida</option>
              <option>Delhi</option>
            </select>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find Project, Builder or Location"
            />
            <button type="submit">
              <i className="fas fa-search"></i>
            </button>

          </form>

        </div>
      </div>
    </div>

  );
};

export default HeroBanner;
