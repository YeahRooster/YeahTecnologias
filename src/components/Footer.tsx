'use client';

import Link from "next/link";
import { Instagram, Phone } from "lucide-react";
import { useWhiteLabel } from "@/context/WhiteLabelContext";

export default function Footer() {
    const { isWhiteLabel, brandName, whatsappNumber } = useWhiteLabel();

    if (isWhiteLabel) {
        return (
            <footer className="footer" style={{ background: '#0f172a' }}>
                <div className="container footer-content">
                    <div className="footer-section">
                        <h3>{brandName && brandName !== 'Catálogo Digital' ? brandName : 'Catálogo Digital'}</h3>
                        <p>Catálogo de tecnología, accesorios y novedades con la mejor calidad y garantía.</p>
                        {whatsappNumber && (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#25D366' }}>
                                    <Phone size={20} /> WhatsApp: +{whatsappNumber}
                                </a>
                            </div>
                        )}
                    </div>
                    <div className="footer-section">
                        <h3>Enlaces</h3>
                        <Link href="/catalogo">Ver Productos</Link>
                        <Link href="/favoritos">Mis Favoritos</Link>
                    </div>
                    <div className="footer-section">
                        <h3>Atención</h3>
                        <p>Hacé tu pedido o consultá stock disponible por WhatsApp.</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} {brandName || 'Catálogo Digital'}. Todos los derechos reservados.</p>
                </div>
            </footer>
        );
    }

    return (
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
                <p>&copy; {new Date().getFullYear()} Yeah! Tecnologías. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}
