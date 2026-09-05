"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton/ScrollToTopButton";
import FloatingContactButtons from "@/components/FloatingContactButtons/FloatingContactButtons";
import { usesStandaloneChrome } from "@/lib/portal/routes.mjs";

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const standalone = usesStandaloneChrome(pathname);

  if (standalone) return children;

  return (
    <>
      <ScrollToTopButton />
      <FloatingContactButtons />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
