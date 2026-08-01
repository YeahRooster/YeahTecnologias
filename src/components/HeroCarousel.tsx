'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './HeroCarousel.module.css';
import { ChevronRight, Loader2 } from 'lucide-react';

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
