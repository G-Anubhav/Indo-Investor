// src/app/layout.js
import "../app/globals.css";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import '@fortawesome/fontawesome-free/css/all.min.css';
import ScrollToTopButton from "@/components/ScrollToTopButton/ScrollToTopButton";
import FloatingContactButtons from "@/components/FloatingContactButtons/FloatingContactButtons";

export const metadata = {
  title: "Indo Real Estate",
  description: "Best Real Estate Website in India",
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
