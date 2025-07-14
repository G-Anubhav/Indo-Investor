"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Navbar as BootstrapNavbar, Nav, Container } from "react-bootstrap";
import navLinks from "@/data/navLinks";
import styles from "./Navbar.module.css";
import logo from "@/images/logo/logo.png";
import logo2 from "@/images/logo/logo.svg";

const SiteNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [hoveredDropdown, setHoveredDropdown] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setExpanded(!expanded);
        setHoveredDropdown(null);
    };

    const handleNavItemClick = () => {
        setExpanded(false);
        setHoveredDropdown(null);
    };

    const handleDropdownClick = (index) => {
        setHoveredDropdown((prev) => (prev === index ? null : index));
    };
    return (
        <header className={`${styles.navbarWrapper}`}>
            {/* <BootstrapNavbar expand="lg" fixed="top" className={`${styles.navbar}`}> */}
            <BootstrapNavbar
                expand="lg"
                fixed="top"
                // expanded={expanded}
                // onToggle={() => setExpanded((prev) => !prev)}
                className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
            >

                <Container>
                    <Link href="/" className="navbar-brand">
                        <div className={`${styles.logoWrapper} ${scrolled ? styles.logoShrink : ''}`}>
                            <Image
                                src={logo2}
                                alt="IndoRealEstate Logo"
                                width={220}
                                height={50}
                                priority
                            />
                        </div>
                    </Link>
                    
                    <BootstrapNavbar.Toggle aria-controls="mainNavbar" className="ms-auto navbar-toggler" />
                    <BootstrapNavbar.Collapse id="mainNavbar">
                        <Nav className="ms-auto">
                            <ul className={styles.navList}>
                                {navLinks.map((item, index) =>
                                    item.dropdown ? (
                                        <li
                                            key={index}
                                            className={`nav-item dropdown ${styles.navItem}`}
                                            onMouseEnter={() => setHoveredDropdown(index)}
                                            onMouseLeave={() => setHoveredDropdown(null)}
                                        >
                                            <span className={`nav-link ${styles.navLink} ${styles.dropdownToggle}`}>
                                                {item.label}
                                                <svg
                                                    className={`${styles.caret} ${hoveredDropdown === index ? styles.rotate : ""}`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={3}
                                                    width="14"
                                                    height="14"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </span>
                                            {hoveredDropdown === index && (
                                                <ul className={`dropdown-menu ${styles.customDropdown}`}>
                                                    {item.children.map((child, childIndex) => (
                                                        <li key={childIndex}>
                                                            <Link href={child.href} className={styles.dropdownItem} onClick={() => setExpanded(false)}>
                                                                {child.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ) : (
                                        <li key={index} className="nav-item">
                                            <Link href={item.href} className={`nav-link ${styles.navLink}`} onClick={() => setExpanded(false)}>
                                                {item.label}
                                            </Link>
                                        </li>
                                    )
                                )}
                            </ul>
                        </Nav>
                    </BootstrapNavbar.Collapse>
                </Container>
            </BootstrapNavbar>
        </header >
    );
};

export default SiteNavbar;

