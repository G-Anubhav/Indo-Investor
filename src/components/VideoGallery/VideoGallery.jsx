"use client";
import React from "react";
import styles from "./VideoGallery.module.css";

const videos = [
    {
        id: 1,
        title: "Unveiling Soon: A rare land along the Gulf of Goa",
        videoUrl: "https://www.youtube.com/embed/rrhiFM6CvMk",
    },
    {
        id: 2,
        title: "Discovering Prime Real Estate in Noida",
        videoUrl: "https://www.youtube.com/embed/wzP32hftUX4",
    },
    {
        id: 3,
        title: "Farm House Projects – Nature Meets Luxury",
        videoUrl: "https://www.youtube.com/embed/JzIARrtixyI",
    },
    {
        id: 4,
        title: "Farm House Projects – Nature Meets Luxury",
        videoUrl: "https://www.youtube.com/embed/KZE5oDtBz0A",
    },
];

const VideoGallery = () => {
    return (
        <section className={styles.videoSection}>
            <div className="container">
                {/* <h2 className={styles.heading}>Our Videos</h2> */}
                <div className={styles.headingWrapper}>
                    <h2 className={styles.heading}>Our Videos</h2>
                </div>
                <div className={styles.grid}>
                    {videos.map((video) => (
                        <div className={styles.videoCard} key={video.id}>
                            <div className={styles.videoWrapper}>
                                <iframe
                                    src={video.videoUrl}
                                    title={video.title}
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <h5 className={styles.videoTitle}>{video.title}</h5>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default VideoGallery;
