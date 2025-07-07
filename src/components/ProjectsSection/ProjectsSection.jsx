"use client";

import { useState } from "react";
import styles from "./ProjectsSection.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRulerCombined, faMapMarkerAlt, faSearch } from "@fortawesome/free-solid-svg-icons";
import projectsData from "@/data/projectsData";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
  { key: "farmhouse", label: "FarmHouses" },
];

const statusColors = {
  Available: "#28a745",
  Sold: "#dc3545",
  "Sold Out": "#6c757d",
  Upcoming: "#ffc107",
  "New Launch": "#007bff",
};

const ProjectsSection = () => {
  const [activeTab, setActiveTab] = useState("residential");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalProject, setModalProject] = useState(null);

  const projects = projectsData[activeTab];
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className={styles.section}>
      <div className="container text-center">
        <motion.h6
          className={styles.label}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          BEST INVESTMENT OPPORTUNITIES
        </motion.h6>

        <motion.h2
          className={styles.heading}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          What Are You Looking For?
        </motion.h2>

        <div className={styles.tabs}>
          {categories.map(({ key, label }) => (
            <motion.button
              key={key}
              className={`${styles.tabButton} ${activeTab === key ? styles.active : ""}`}
              onClick={() => setActiveTab(key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {label}
            </motion.button>
          ))}
        </div>

        <div className={styles.searchInputContainer}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by project name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchBox}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + searchTerm}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
          >
            <Swiper
              spaceBetween={20}
              slidesPerView={1}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              loop={true}
              navigation={true}
              modules={[Autoplay, Navigation]}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
              }}
            >
              {filteredProjects.map((project, i) => (
                <SwiperSlide key={i}>
                  <motion.div whileHover={{ y: -5 }}>
                    <div className={styles.card} onClick={() => setModalProject(project)}>
                      <div className={styles.imageWrapper}>
                        {project.status && (
                          <span
                            className={styles.statusBadge}
                            style={{ backgroundColor: statusColors[project.status] || "#555" }}
                          >
                            {project.status}
                          </span>
                        )}
                        <img src={project.image?.src || project.image} alt={project.name} />
                        <span className={styles.badge}>New Launch</span>
                      </div>
                      <div className={styles.info}>
                        <h5>{project.name}</h5>
                        <div className={styles.infoItem}>
                          <FontAwesomeIcon icon={faRulerCombined} />
                          <span>{project.size}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          <span>{project.location}</span>
                        </div>
                        <div className={styles.price}>{project.price}</div>
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </AnimatePresence>

        {modalProject && (
          <div className={styles.modalOverlay} onClick={() => setModalProject(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3>{modalProject.name}</h3>
              <p>
                <FontAwesomeIcon icon={faMapMarkerAlt} /> {modalProject.location}
              </p>
              <img
                src={modalProject.image?.src || modalProject.image}
                alt={modalProject.name}
                style={{ width: "100%", borderRadius: "6px", margin: "16px 0" }}
              />
              <p>{modalProject.price}</p>
              <button onClick={() => setModalProject(null)} className={styles.closeBtn}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;



// "use client";

// import { useState } from "react";
// import styles from "./ProjectsSection.module.css";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay, Navigation } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/autoplay";
// import "swiper/css/navigation";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faRulerCombined, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
// import projectsData from "@/data/projectsData";
// import { motion, AnimatePresence } from "framer-motion";

// const categories = [
//   { key: "residential", label: "Residential" },
//   { key: "commercial", label: "Commercial" },
//   { key: "holiday", label: "Holiday Homes" },
// ];

// const ProjectsSection = () => {
//   const [activeTab, setActiveTab] = useState("residential");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [modalProject, setModalProject] = useState(null);

//   const projects = projectsData[activeTab];
//   const filteredProjects = projects.filter((project) =>
//     project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     project.location.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <section className={styles.section}>
//       <div className="container text-center">
//         <motion.h6
//           className={styles.label}
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//         >
//           BEST INVESTMENT OPPORTUNITIES
//         </motion.h6>

//         <motion.h2
//           className={styles.heading}
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//         >
//           What Are You Looking For?
//         </motion.h2>

//         <div className={styles.tabs}>
//           {categories.map(({ key, label }) => (
//             <motion.button
//               key={key}
//               className={`${styles.tabButton} ${activeTab === key ? styles.active : ""}`}
//               onClick={() => setActiveTab(key)}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               {label}
//             </motion.button>
//           ))}
//         </div>

//         <input
//           type="text"
//           placeholder="Search by project name or location..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className={styles.searchBox}
//         />

//         <AnimatePresence mode="wait">
//           <motion.div
//             key={activeTab + searchTerm}
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 30 }}
//             transition={{ duration: 0.4 }}
//           >
//             <Swiper
//               spaceBetween={20}
//               slidesPerView={1}
//               autoplay={{ delay: 3500, disableOnInteraction: false }}
//               loop={true}
//               navigation={true}
//               modules={[Autoplay, Navigation]}
//               breakpoints={{
//                 640: { slidesPerView: 2 },
//                 1024: { slidesPerView: 4 },
//               }}
//             >
//               {filteredProjects.map((project, i) => (
//                 <SwiperSlide key={i}>
//                   <motion.div whileHover={{ y: -5 }}>
//                     <div className={styles.card} onClick={() => setModalProject(project)}>
//                       <div className={styles.imageWrapper}>
//                         {project.status && <span className={styles.statusBadge}>{project.status}</span>}
//                         <img src={project.image?.src || project.image} alt={project.name} />
//                         <span className={styles.badge}>New Launch</span>
//                       </div>
//                       <div className={styles.info}>
//                         <h5>{project.name}</h5>
//                         <div className={styles.infoItem}>
//                           <FontAwesomeIcon icon={faRulerCombined} />
//                           <span>{project.size}</span>
//                         </div>
//                         <div className={styles.infoItem}>
//                           <FontAwesomeIcon icon={faMapMarkerAlt} />
//                           <span>{project.location}</span>
//                         </div>
//                         <div className={styles.price}>{project.price}</div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 </SwiperSlide>
//               ))}
//             </Swiper>
//           </motion.div>
//         </AnimatePresence>

//         {modalProject && (
//           <div className={styles.modalOverlay} onClick={() => setModalProject(null)}>
//             <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
//               <h3>{modalProject.name}</h3>
//               <p>
//                 <FontAwesomeIcon icon={faMapMarkerAlt} /> {modalProject.location}
//               </p>
//               <img
//                 src={modalProject.image?.src || modalProject.image}
//                 alt={modalProject.name}
//                 style={{ width: "100%", borderRadius: "6px", margin: "16px 0" }}
//               />
//               <p>{modalProject.price}</p>
//               <button onClick={() => setModalProject(null)} className={styles.closeBtn}>
//                 Close
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default ProjectsSection;
