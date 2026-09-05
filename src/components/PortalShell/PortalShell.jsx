"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBars, FaBorderAll, FaChartLine, FaChevronDown, FaFileInvoiceDollar,
  FaIdCard, FaKey, FaListUl, FaShieldAlt, FaSignOutAlt, FaSitemap,
  FaTachometerAlt, FaTimes, FaUser, FaUserCircle, FaUserFriends, FaWallet,
} from "react-icons/fa";
import logo from "@/images/logo/new-logo.png";
import { logoutAction } from "@/app/actions/auth";
import { isExecutiveRole } from "@/lib/auth/access.mjs";
import styles from "./PortalShell.module.css";

function NavLink({ href, icon: Icon, label, pathname, section = false, onNavigate }) {
  const active = section ? pathname === href || pathname.startsWith(`${href}/`) : pathname === href;
  return <Link href={href} aria-current={active ? "page" : undefined} onClick={onNavigate}><Icon /><span>{label}</span></Link>;
}

export default function PortalShell({ children, profile, memberCode, dictionary, phase2Dictionary, phase3Dictionary, phase4Dictionary }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeButton = useRef(null);
  const accountMenu = useRef(null);
  const executive = isExecutiveRole(profile.role_key);
  const initial = (profile.display_name || profile.full_name || profile.email).charAt(0).toUpperCase();
  const currentContext = pathname.split("/").filter(Boolean).slice(-1)[0]?.replaceAll("-", " ") || dictionary.portal.dashboard;

  useEffect(() => setDrawerOpen(false), [pathname]);
  useEffect(() => {
    if (!drawerOpen) return undefined;
    closeButton.current?.focus();
    const closeOnEscape = (event) => event.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [drawerOpen]);
  useEffect(() => {
    const closeAccountMenu = (event) => {
      const menu = accountMenu.current;
      if (!menu?.open) return;
      if (event.type === "keydown" && event.key === "Escape") menu.open = false;
      if (event.type === "pointerdown" && !menu.contains(event.target)) menu.open = false;
    };
    document.addEventListener("pointerdown", closeAccountMenu);
    document.addEventListener("keydown", closeAccountMenu);
    return () => {
      document.removeEventListener("pointerdown", closeAccountMenu);
      document.removeEventListener("keydown", closeAccountMenu);
    };
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className={styles.shell}>
      <button className={styles.mobileMenuButton} type="button" onClick={() => setDrawerOpen(true)} aria-expanded={drawerOpen} aria-controls="portal-sidebar" title="Open navigation"><FaBars /><span>Menu</span></button>
      {drawerOpen && <button className={styles.drawerBackdrop} type="button" onClick={closeDrawer} aria-label="Close navigation" />}
      <aside className={styles.sidebar} id="portal-sidebar" data-open={drawerOpen || undefined}>
        <div className={styles.sidebarBrand}>
          <Link href="/" className={styles.logoLink} onClick={closeDrawer}><Image src={logo} alt={dictionary.common.brand} width={88} height={88} priority /></Link>
          <button ref={closeButton} className={styles.drawerClose} type="button" onClick={closeDrawer} title="Close navigation"><FaTimes /></button>
        </div>
        <nav className={styles.navigation} aria-label="Portal navigation">
          <div className={styles.navGroup}><span>Overview</span><NavLink href="/dashboard" icon={FaTachometerAlt} label={dictionary.portal.dashboard} pathname={pathname} onNavigate={closeDrawer} /></div>
          <div className={styles.navGroup}><span>Network</span><NavLink href="/network" icon={FaSitemap} label={phase2Dictionary.navigationNetwork} pathname={pathname} onNavigate={closeDrawer} /><NavLink href="/network/referrals" icon={FaUserFriends} label={phase2Dictionary.navigationReferrals} pathname={pathname} onNavigate={closeDrawer} /><NavLink href="/network/index" icon={FaListUl} label={phase2Dictionary.navigationIndex} pathname={pathname} onNavigate={closeDrawer} /></div>
          <div className={styles.navGroup}><span>Properties</span><NavLink href="/inventory" icon={FaBorderAll} label={phase2Dictionary.navigationInventory} pathname={pathname} section onNavigate={closeDrawer} /><NavLink href="/property-payments" icon={FaFileInvoiceDollar} label={phase3Dictionary.navigationPayments} pathname={pathname} onNavigate={closeDrawer} /></div>
          <div className={styles.navGroup}><span>Finance</span><NavLink href="/wallets" icon={FaWallet} label={phase3Dictionary.navigationWallets} pathname={pathname} onNavigate={closeDrawer} /><NavLink href="/earnings" icon={FaChartLine} label={phase3Dictionary.navigationEarnings} pathname={pathname} onNavigate={closeDrawer} /></div>
          <div className={styles.navGroup}><span>Account</span><NavLink href="/profile" icon={FaUser} label="Profile" pathname={pathname} onNavigate={closeDrawer} /><NavLink href="/kyc" icon={FaIdCard} label={phase4Dictionary.navigationKyc} pathname={pathname} onNavigate={closeDrawer} />{executive && <NavLink href="/mfa" icon={FaKey} label="Security verification" pathname={pathname} onNavigate={closeDrawer} />}</div>
          {executive && <div className={styles.navGroup}><span>Administration</span><NavLink href="/admin" icon={FaShieldAlt} label={dictionary.portal.administration} pathname={pathname} onNavigate={closeDrawer} /><NavLink href="/admin/financials" icon={FaFileInvoiceDollar} label="Financial operations" pathname={pathname} onNavigate={closeDrawer} /><NavLink href="/admin/kyc" icon={FaIdCard} label={phase4Dictionary.navigationReview} pathname={pathname} section onNavigate={closeDrawer} /></div>}
        </nav>
        <Link href="/profile" className={styles.sidebarUser} onClick={closeDrawer}>
          <div className={styles.avatar} aria-hidden="true">{initial}</div>
          <div><strong>{profile.display_name}</strong><span>{memberCode || profile.role_key}</span></div>
        </Link>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.pageContext}><span>Workspace</span><strong>{currentContext}</strong></div>
          <div className={styles.topbarActions}>
            <details ref={accountMenu} className={styles.accountMenu}>
              <summary><span className={styles.topAvatar}>{initial}</span><span className={styles.topIdentity}><strong>{profile.display_name}</strong><small>{memberCode || profile.role_key}</small></span><FaChevronDown /></summary>
              <div className={styles.accountPopover}>
                <div><FaUserCircle /><p><strong>{profile.display_name}</strong><span>{profile.role_key} | {memberCode || "Member"}</span></p></div>
                <Link href="/profile"><FaUser /> Profile</Link>
                <Link href="/kyc"><FaIdCard /> KYC workspace</Link>
                {executive && <Link href="/mfa"><FaKey /> Security verification</Link>}
                <form action={logoutAction}><button type="submit"><FaSignOutAlt /> {dictionary.portal.logout}</button></form>
              </div>
            </details>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
