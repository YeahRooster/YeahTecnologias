'use client';

import { Book, TrendingUp, Target, Lightbulb, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './blog.module.css';

// Artículos de ejemplo (en el futuro pueden venir de una base de datos)
const articles = [
    {
        id: 'como-vender-auriculares-gamer',
        title: 'Cómo vender auriculares gamer en 2025',
        excerpt: 'Descubrí las claves para maximizar tus ventas en uno de los productos más buscados.',
        category: 'Guías de Venta',
        readTime: '5 min',
        icon: TrendingUp,
        color: '#667eea',
    },
    {
        id: 'errores-comunes-revender-celulares',
        title: '5 errores que todo revendedor de celulares debe evitar',
        excerpt: 'Aprendé de los errores más comunes y ahorrá tiempo y dinero en tu negocio.',
        category: 'Consejos',
        readTime: '4 min',
        icon: Target,
        color: '#f093fb',
    },
    {
        id: 'tendencias-tech-2025',
        title: 'Tendencias tech que tus clientes buscan en 2025',
        excerpt: 'Mantenete al día con las tecnologías más demandadas del momento.',
        category: 'Tendencias',
        readTime: '6 min',
        icon: Lightbulb,
        color: '#4facfe',
    },
];

export default function BlogPage() {
    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <Book size={48} />
                <h1>Centro de Recursos</h1>
                <p>Guías, consejos y estrategias para vender más</p>
            </div>

            <div className={styles.articlesGrid}>
                {articles.map((article) => {
                    const Icon = article.icon;
                    return (
                        <Link
                            href={`/blog/${article.id}`}
                            key={article.id}
                            className={styles.articleCard}
                            style={{ '--article-color': article.color } as React.CSSProperties}
                        >
                            <div className={styles.articleIcon}>
                                <Icon size={32} />
                            </div>
                            <div className={styles.articleContent}>
                                <span className={styles.category}>{article.category}</span>
                                <h2>{article.title}</h2>
                                <p>{article.excerpt}</p>
                                <div className={styles.articleMeta}>
                                    <span>{article.readTime} de lectura</span>
                                    <ArrowRight size={20} className={styles.arrow} />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className={styles.cta}>
                <h2>¿Querés más consejos exclusivos?</h2>
                <p>Registrate y recibí tips, ofertas especiales y recursos premium para revendedores</p>
                <Link href="/registro" className={styles.ctaButton}>
                    Registrarme Gratis
                </Link>
            </div>
        </div>
    );
}
