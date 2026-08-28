'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './HeroCarousel.module.css';
import { ChevronRight, Loader2, Sparkles, Package } from 'lucide-react';
import { useWhiteLabel } from '@/context/WhiteLabelContext';

interface Banner {
    id: string;
    imagenUrl: string;
    titulo: string;
    descripcion: string;
    link: string;
    textoBoton: string;
    activo: boolean;
}

export default function HeroCarousel() {
    const { isWhiteLabel, brandName, brandLogo } = useWhiteLabel();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBanners() {
            try {
                const res = await fetch('/api/banners');
                if (res.ok) {
                    const data = await res.json();
                    setBanners(data);
                }
            } catch (e) {
                console.error("Error fetching banners:", e);
            } finally {
                setLoading(false);
            }
        }
        fetchBanners();
    }, []);

    // Auto-play
    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrent(prev => (prev + 1) % banners.length);
        }, 5000); // Cambia cada 5 segundos

        return () => clearInterval(interval);
    }, [banners.length]);

    if (loading) {
        return (
            <div className={styles.carouselContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' }}>
                <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#cbd5e1' }} />
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // SI ESTÁ EN MODO MARCA BLANCA: Mostrar Hero Banner Neutro y Personalizado del Revendedor (oculta banners mayoristas y de redes)
    if (isWhiteLabel) {
        return (
            <div className={styles.carouselContainer} style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ maxWidth: '750px', margin: '0 auto', color: 'white' }}>
                    {brandLogo ? (
                        <img src={brandLogo} alt={brandName} style={{ maxHeight: '70px', maxWidth: '240px', objectFit: 'contain', marginBottom: '1rem' }} />
                    ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.4rem 1rem', borderRadius: '30px', fontSize: '0.85rem', marginBottom: '1rem', color: '#38bdf8' }}>
                            <Sparkles size={16} /> Catálogo Oficial
                        </div>
                    )}
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem', color: '#f8fafc' }}>
                        {brandName && brandName !== 'Catálogo Digital' ? `Bienvenido a ${brandName}` : 'Catálogo Digital de Tecnología'}
                    </h1>
                    <p style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                        Conocé todas nuestras novedades, accesorios y productos con garantía y stock disponible.
                    </p>
                    <Link
                        href="/catalogo"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: '#0284c7',
                            color: 'white',
                            padding: '0.8rem 1.75rem',
                            borderRadius: '10px',
                            fontWeight: 700,
                            textDecoration: 'none',
                            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
                        }}
                    >
                        <Package size={18} /> Explorar Productos
                    </Link>
                </div>
            </div>
        );
    }

    if (banners.length === 0) return null;

    return (
        <div className={styles.carouselContainer}>
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`${styles.slide} ${index === current ? styles.active : ''}`}
                    style={{ backgroundImage: `url(${banner.imagenUrl})` }}
                >
                    <div className={styles.overlay}></div>
                    <div className={styles.content}>
                        <h2 className={styles.title}>{banner.titulo}</h2>
                        <p className={styles.description}>{banner.descripcion}</p>

                        {/* Detectar si es link externo o interno */}
                        {banner.link.startsWith('http') ? (
                            <a href={banner.link} target="_blank" rel="noopener noreferrer" className={styles.ctaButton}>
                                {banner.textoBoton} <ChevronRight size={16} style={{ display: 'inline', marginBottom: '-2px' }} />
                            </a>
                        ) : (
                            <Link href={banner.link} className={styles.ctaButton}>
                                {banner.textoBoton} <ChevronRight size={16} style={{ display: 'inline', marginBottom: '-2px' }} />
                            </Link>
                        )}
                    </div>
                </div>
            ))}

            {banners.length > 1 && (
                <div className={styles.dots}>
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.dot} ${index === current ? styles.activeDot : ''}`}
                            onClick={() => setCurrent(index)}
                            aria-label={`Ir al banner ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
