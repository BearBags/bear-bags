import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import { CartProvider } from "./context/CartContext";
// import { Barlow_Condensed } from 'next/font/google';

// const barlow = Barlow_Condensed({
//   subsets: ['latin'],
//   weight: ['700', '800'],
// });
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bear Bags Website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${manrope.className} min-h-screen flex flex-col`}>
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}