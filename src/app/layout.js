// src/app/layout.js
import "../app/globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import SiteChrome from "@/components/SiteChrome/SiteChrome";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Turning Dreams into Assets | Indo Investor Infra World – Real Estate Experts",
  description: "Invest in verified plots, villas, and commercial spaces with Indo Investor Infra World. Trusted real estate experts delivering secure, high-growth opportunities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
