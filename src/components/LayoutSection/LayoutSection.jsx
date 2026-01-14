"use client";
import { useState } from "react";
import styles from "./LayoutSection.module.css";
import {
  FaFilePdf,
  FaDownload,
  FaCheckCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import ImageOverlay from "./ImageOverlay";

const LayoutSection = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>{data.title}</h2>
          <p>{data.description}</p>
        </motion.div>

        <div className={styles.content}>
          {/* Gallery */}
          <div className={styles.gallery}>
            {data.images.map((item, index) => (
              <motion.div
                key={index}
                className={styles.imageCard}
                whileHover={{ scale: 1.03 }}
                onClick={() => setActiveIndex(index)}
              >
                <img src={item.src} alt={item.caption} />
                <div className={styles.caption}>{item.caption}</div>
              </motion.div>
            ))}
          </div>

          {/* Download Card */}
          <motion.div
            className={styles.downloadCard}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className={styles.icon}>
              <FaFilePdf />
            </div>

            <h3>Approved Layout & Legal Documents</h3>

            <ul>
              {data.features.map((feature, index) => (
                <li key={index}>
                  <FaCheckCircle />
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href={data.pdf.url}
              className={styles.downloadBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDownload />
              Download PDF
            </a>

            <span className={styles.fileName}>
              {data.pdf.name}
            </span>
          </motion.div>
        </div>
      </div>

      {/* ✅ Portal-based overlay */}
      {activeIndex !== null && (
        <ImageOverlay
            images={data.images}
            startIndex={activeIndex}
            onClose={() => setActiveIndex(null)}
        />
        )}
    </section>
  );
};

export default LayoutSection;



// import styles from "./LayoutSection.module.css";
// import { FaFilePdf, FaDownload, FaCheckCircle } from "react-icons/fa";
// import { motion } from "framer-motion";

// const LayoutSection = ({ data }) => {
//   if (!data) return null;
//   return (
//     <section className={styles.section}>
//       <div className={styles.container}>
//         {/* Header */}
//         <motion.div
//           className={styles.header}
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           viewport={{ once: true }}
//         >
//           <h2>{data.title}</h2>
//           <p>{data.description}</p>
//         </motion.div>

//         <div className={styles.content}>
//           {/* Left: Layout Images */}
//           <div className={styles.gallery}>
//             {data.images.map((item, index) => (
//               <motion.div
//                 key={index}
//                 className={styles.imageCard}
//                 whileHover={{ scale: 1.03 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <img src={item.src} alt={item.caption} />
//                 <div className={styles.caption}>{item.caption}</div>
//               </motion.div>
//             ))}
//           </div>

//           {/* Right: PDF Download */}
//           <motion.div
//             className={styles.downloadCard}
//             initial={{ opacity: 0, x: 40 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true }}
//           >
//             {/* <div className={styles.icon}>
//               <FaFilePdf />
//             </div> */}

//             <h3>Approved Layout & Legal Documents</h3>

//             <ul>
//               <li>
//                 <FaCheckCircle /> Detailed Land Layout Plan
//               </li>
//               <li>
//                 <FaCheckCircle /> N.A. Order Stamp Papers
//               </li>
//               <li>
//                 <FaCheckCircle /> Plot Demarcation & Road Access
//               </li>
//             </ul>

//             <a
//               href={data.pdf.url}
//               download
//               className={styles.downloadBtn}
//             >
//               <FaDownload />
//               Download PDF
//             </a>

//             <span className={styles.fileName}>
//               {data.pdf.name}
//             </span>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default LayoutSection;
