import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./layout.css";
import Link from "next/link";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { WhiteLabelProvider } from "@/context/WhiteLabelContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PriceWarning from "@/components/PriceWarning";
import { Analytics } from "@vercel/analytics/react";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yeah! Tecnologías | Insumos tecnológicos al por mayor",
  description: "No es solo tecnología... es Yeah! Venta de insumos tecnológicos al por mayor con los mejores precios.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <WhiteLabelProvider>
          <CartProvider>
            <FavoritesProvider>
              <PriceWarning />
              <Header />
              <CartDrawer />
              <WhatsAppButton />
              <main>{children}</main>
              <Footer />
            </FavoritesProvider>
          </CartProvider>
        </WhiteLabelProvider>
        <Analytics />
      </body>
    </html>
  );
}
