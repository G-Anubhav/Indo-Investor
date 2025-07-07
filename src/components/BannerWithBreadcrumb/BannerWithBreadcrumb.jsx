import Image from "next/image";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import styles from "./BannerWithBreadcrumb.module.css";

const BannerWithBreadcrumb = ({ title, bannerImage, breadcrumbs }) => {
  return (
    <div className={styles.bannerSection}>
      <div className={styles.bannerContent}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <div className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbItem}>
            <FaHome className={styles.homeIcon} />
            <span>Home</span>
          </Link>
          {breadcrumbs.length > 1 && breadcrumbs.slice(1).map((crumb, idx) => (
            <span key={idx} className={styles.breadcrumbWrapper}>
              <FaChevronRight className={styles.caret} />
              {idx === breadcrumbs.length - 2 ? (
                <span className={styles.current}>{crumb}</span>
              ) : (
                <Link href={`/${crumb.toLowerCase()}`} className={styles.breadcrumbItem}>
                  {crumb}
                </Link>
              )}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.bannerBg}>
        <Image
          src={bannerImage}
          alt={title}
          fill
          className={styles.bannerImage}
          priority
        />
      </div>
    </div>
  );
};

export default BannerWithBreadcrumb;
