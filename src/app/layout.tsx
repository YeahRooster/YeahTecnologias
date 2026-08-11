import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./layout.css";
import Link from "next/link";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PriceWarning from "@/components/PriceWarning";
import { Instagram, Phone } from "lucide-react";
import { Analytics } from "@vercel/analytics/next";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yeah! Tecnologías | Insumos tecnológicos al por mayor",
  description: "No es solo tecnología... es Yeah! Venta de insumos tecnológicos al por mayor con los mejores precios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <CartProvider>
          <FavoritesProvider>
            <PriceWarning />
            <Header />
            <CartDrawer />
            <WhatsAppButton />
            <main>{children}</main>

            <footer className="footer">
              <div className="container footer-content">
                <div className="footer-section">
                  <h3>Yeah! Tecnologías</h3>
                  <p>Tu socio confiable para insumos tecnológicos al por mayor. Calidad y precio garantizados.</p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <a href="https://www.instagram.com/yeahtecnologias/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E1306C' }}>
                      <Instagram size={20} /> Instagram
                    </a>
                    <a href="https://wa.me/5493425924747" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#25D366' }}>
                      <Phone size={20} /> WhatsApp
                    </a>
                  </div>
                </div>
                <div className="footer-section">
                  <h3>Enlaces Rápidos</h3>
                  <Link href="/catalogo">Catálogo</Link>
                  <Link href="/cuenta">Mi Cuenta</Link>
                  <a href="https://wa.me/5493425924747" target="_blank" rel="noopener noreferrer">Contacto</a>
                </div>
                <div className="footer-section">
                  <h3>Contacto</h3>
                  <p>WhatsApp: +54 9 342 592 4747</p>
                  <p>Email: ventas@yeahtecnologias.com</p>
                </div>
              </div>
              <div className="footer-bottom">
                <p>&copy; 2024 Yeah! Tecnologías. Todos los derechos reservados.</p>
              </div>
            </footer>
          </FavoritesProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
