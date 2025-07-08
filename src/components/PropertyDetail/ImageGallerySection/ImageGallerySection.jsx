'use client';

import React, { useState } from 'react';
import styles from './ImageGallerySection.module.css';
import { motion } from 'framer-motion';

import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Download from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';

const ImageGallerySection = ({ gallery }) => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!gallery || gallery.length === 0) return null;

  const slides = gallery.map((img) => ({ src: img }));

  return (
    <section id="gallery" className={styles.gallerySection}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.heading}>Image Gallery</h2>
          <div className={styles.grid}>
            {gallery.map((img, i) => (
              <div className={styles.imgWrapper} key={i}>
                <img
                  src={img}
                  alt={`gallery-${i}`}
                  onClick={() => {
                    setIndex(i);
                    setOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
        plugins={[Zoom, Fullscreen, Download]}
      />
    </section>
  );
};

export default ImageGallerySection;
