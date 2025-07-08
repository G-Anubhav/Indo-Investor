// src/app/layout.js
import "../app/globals.css";
import { Nunito_Sans } from 'next/font/google'; 
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import '@fortawesome/fontawesome-free/css/all.min.css';

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['200', '400', '600', '700', '800', '1000'], // Match the weights you need
  display: 'swap',
})

export const metadata = {
  title: "Indo Real Estate",
  description: "Best Real Estate Website in India",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={nunitoSans.className}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
