"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import styles from "./Footer.module.css";
import { FaCaretRight, FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import Image from "next/image";
import logo from "@/images/logo/logo.svg";

const companyLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Videos", href: "/videos" },
  { label: "Properties", href: "/properties" },
  { label: "News Events", href: "/resources/new-events" },
  { label: "Careers", href: "/careers" },
  { label: "Contact Us", href: "/contact-us" },
];

const propertyLinks = [
  { label: "Residential", href: "/properties/residential" },
  { label: "Commercial", href: "/properties/commercial" },
  { label: "Farm House", href: "/properties/farm-house" },
  { label: "Flat", href: "/properties/flat" },
  { label: "Simplex", href: "/properties/simplex" },
  { label: "Duplex", href: "/properties/duplex" },
  { label: "Villas", href: "/properties/villas" },
  { label: "Office Space", href: "/properties/office-space" },
  { label: "Shop", href: "/properties/shop" },
  { label: "Co-working Space", href: "/properties/coworking-space" },
];

const usefulLinks = [
  { label: "Our Team", href: "/#ourTeam" },
  { label: "Visit Our Office", href: "/contact-us#officemap" },
  { label: "News Media", href: "/resources/new-events" },
  { label: "Social Connect", href: "/resources/social-connect" },
  { label: "Enquire Now", href: "/contact-us" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

const HoverableListItem = ({ label, href }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!href) {
    console.warn(`Missing href for label: ${label}`);
    return null;
  }

  return (
    <li
      className={styles.hoverItem}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && <FaCaretRight className={styles.caretIcon} />}
      <Link href={href} className={styles.linkItem}>
        {label}
      </Link>
    </li>
  );
};

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Top CTA Banner */}
      <div className={styles.ctaWrapper}>
        <div className={styles.ctaBanner}>
          <div className={styles.ctaText}>
            <h2>Looking for a dream home?</h2>
            <p>We can help you realize your dream of a new home</p>
          </div>
          <button className={styles.exploreBtn}>
            Explore Properties <span>→</span>
          </button>
        </div>
      </div>

      {/* Footer Row */}
      <div className={styles.footerRow}>
        {/* Column 1: Logo and Address */}
        <div className={styles.column}>
          <Image src={logo} alt="logo" className={styles.logoImg} />
          <p>Indo Investors is a Trusted Real Estate Investment Firm specializing in Secure, High-return Properties.</p>
          <ul className={styles.contactInfo}>
            <li><FaMapMarkerAlt className={styles.marker} /> F-16, First Floor, Block D-242, Sector 63, Noida, Uttar Pradesh 201301</li>
            <li><FaPhoneAlt /> 01204302435 </li>
            <li><FaEnvelope /> info@indoinvestor.com</li>
          </ul>
          <div className={styles.socialIcons}>
            <Link href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className={styles.facebook}>
              <FaFacebookF />
            </Link>
            <Link href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className={styles.instagram}>
              <FaInstagram />
            </Link>
            <Link href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className={styles.linkedin}>
              <FaLinkedinIn />
            </Link>
            <Link href="https://youtube.com" aria-label="Youtube" target="_blank" rel="noopener noreferrer" className={styles.youtube}>
              <FaYoutube />
            </Link>
          </div>
        </div>

        {/* Column 2: Company */}
        <div className={styles.column}>
          <h4>Company</h4>
          {companyLinks.map((item, index) => (
            <HoverableListItem key={index} label={item.label} href={item.href} />
          ))}
        </div>

        {/* Column 3: Services */}
        <div className={styles.column}>
          <h4>Properties</h4>
          {propertyLinks.map((item, index) => (
            <HoverableListItem key={index} label={item.label} href={item.href} />
          ))}
        </div>

        {/* Column 4: Customer Care */}
        <div className={styles.column}>
          <h4>Useful Links</h4>
          {usefulLinks.map((item, index) => (
            <HoverableListItem key={index} label={item.label} href={item.href} />
          ))}
        </div>

        {/* Column 5: Newsletter */}
        <div className={styles.column}>
          <h4>Newsletter</h4>
          <p>Subscribe to our weekly Newsletter and receive updates via email.</p>
          <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <select required>
              <option value="">I am a...</option>
              <option value="buyer">Buyer</option>
              <option value="investor">Investor</option>
              <option value="agent">Agent</option>
              <option value="other">Other</option>
            </select>
            <button type="submit">SEND</button>
          </form>

        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.footerBottom}>
        <p>Copyright © 2025 IndoInvestorInfra. All Rights Reserved. <br />Designed & Developed by <a href="https://github.com/g-anubhav" target="_blank">Anubhav Goyal</a>.</p>
      </div>
    </footer>
  );
};

export default Footer;
