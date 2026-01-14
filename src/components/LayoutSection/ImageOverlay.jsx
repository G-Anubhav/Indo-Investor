// import { useEffect } from "react";
// import { createPortal } from "react-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { FaTimes } from "react-icons/fa";
// import styles from "./LayoutSection.module.css";

// const ImageOverlay = ({ image, onClose }) => {
//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, []);

//   return createPortal(
//     <AnimatePresence>
//       <motion.div
//         className={styles.overlay}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//       >
//         {/* Backdrop */}
//         <div
//           className={styles.backdrop}
//           onClick={onClose}
//         />

//         {/* Image Container */}
//         <motion.div
//           className={styles.overlayContent}
//           initial={{ scale: 0.92, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.92, opacity: 0 }}
//         >
//           <button
//             className={styles.closeBtn}
//             onClick={onClose}
//           >
//             <FaTimes />
//           </button>

//           <img src={image.src} alt={image.caption} />
//           <p>{image.caption}</p>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>,
//     document.body
//   );
// };

// export default ImageOverlay;

"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaSearchPlus,
  FaSearchMinus,
} from "react-icons/fa";
import styles from "./LayoutSection.module.css";

const ImageOverlay = ({ images, startIndex = 0, onClose }) => {
  const [index, setIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const total = images.length;
  const image = images[index];

  /* 🔒 Lock background scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, []);

  /* ⌨ Keyboard navigation */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const next = () => {
    setIndex((prev) => (prev + 1) % total);
    resetTransform();
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + total) % total);
    resetTransform();
  };

  const resetTransform = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  /* 🔍 Zoom with mouse wheel */
  const handleWheel = (e) => {
    e.preventDefault();
    setScale((prev) =>
      Math.min(3, Math.max(1, prev + (e.deltaY < 0 ? 0.2 : -0.2)))
    );
  };

  /* 🖐 Drag to pan */
  const handleMouseDown = (e) => {
    if (scale === 1) return;
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className={styles.backdrop} onClick={onClose} />

        {/* Viewer */}
        <div className={styles.viewer}>
          {/* Top Controls */}
          <div className={styles.topBar}>
            <span className={styles.counter}>
              {index + 1} / {total}
            </span>

            <div className={styles.zoomControls}>
              <button onClick={() => setScale((s) => Math.min(3, s + 0.2))}>
                <FaSearchPlus />
              </button>
              <button onClick={() => setScale((s) => Math.max(1, s - 0.2))}>
                <FaSearchMinus />
              </button>
            </div>

            <button className={styles.closeBtn} onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          {/* Navigation */}
          {total > 1 && (
            <>
              <button className={styles.navLeft} onClick={prev}>
                <FaChevronLeft />
              </button>
              <button className={styles.navRight} onClick={next}>
                <FaChevronRight />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className={styles.imageWrapper}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={image.src}
              alt={image.caption}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                cursor: scale > 1 ? "grab" : "zoom-in",
              }}
              draggable={false}
            />
          </div>

          <p className={styles.captionOverlay}>{image.caption}</p>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ImageOverlay;
