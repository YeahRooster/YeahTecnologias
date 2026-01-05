'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { banners } from '@/data/banners';
import styles from './HeroCarousel.module.css';
import { ChevronRight } from 'lucide-react';

export default function HeroCarousel() {
    // Solo mostrar banners activos
    const activeBanners = banners.filter(b => b.isActive);
    const [current, setCurrent] = useState(0);

    // Auto-play
    useEffect(() => {
        if (activeBanners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrent(prev => (prev + 1) % activeBanners.length);
        }, 5000); // Cambia cada 5 segundos

        return () => clearInterval(interval);
    }, [activeBanners.length]);

    if (activeBanners.length === 0) return null;

    return (
        <div className={styles.carouselContainer}>
            {activeBanners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`${styles.slide} ${index === current ? styles.active : ''}`}
                    style={{ backgroundImage: `url(${banner.desktopImage})` }}
                >
                    <div className={styles.overlay}></div>
                    <div className={styles.content}>
                        <h2 className={styles.title}>{banner.title}</h2>
                        <p className={styles.description}>{banner.description}</p>

                        {/* Detectar si es link externo o interno */}
                        {banner.link.startsWith('http') ? (
                            <a href={banner.link} target="_blank" rel="noopener noreferrer" className={styles.ctaButton}>
                                {banner.buttonText} <ChevronRight size={16} style={{ display: 'inline', marginBottom: '-2px' }} />
                            </a>
                        ) : (
                            <Link href={banner.link} className={styles.ctaButton}>
                                {banner.buttonText} <ChevronRight size={16} style={{ display: 'inline', marginBottom: '-2px' }} />
                            </Link>
                        )}
                    </div>
                </div>
            ))}

            {activeBanners.length > 1 && (
                <div className={styles.dots}>
                    {activeBanners.map((_, index) => (
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
