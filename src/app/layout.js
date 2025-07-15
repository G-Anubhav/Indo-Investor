// src/app/layout.js
import "../app/globals.css";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import '@fortawesome/fontawesome-free/css/all.min.css';
import ScrollToTopButton from "@/components/ScrollToTopButton/ScrollToTopButton";
import FloatingContactButtons from "@/components/FloatingContactButtons/FloatingContactButtons";

export const metadata = {
  title: "Turning Dreams into Assets | Indo Investor Infra – Real Estate Experts",
  description: "Invest in verified plots, villas, and commercial spaces with Indo Investor Infra. Trusted real estate experts delivering secure, high-growth opportunities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ScrollToTopButton />
        <FloatingContactButtons />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
