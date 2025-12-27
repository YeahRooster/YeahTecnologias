'use client';

import { use } from 'react';
import { getPostBySlug, getRelatedPosts } from '@/data/blogPosts';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
import Link from 'next/link';
import styles from './article.module.css';

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const article = getPostBySlug(slug);

    if (!article) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h1>Artículo no encontrado</h1>
                <Link href="/blog" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                    Volver al blog
                </Link>
            </div>
        );
    }

    const relatedPosts = getRelatedPosts(slug, article.category);

    return (
        <div className={styles.articleContainer}>
            {/* HERO DEL ARTICULO */}
            <div className={styles.heroImage}>
                <img src={article.imageUrl} alt={article.title} />
                <div className={styles.heroOverlay}>
                    <div className="container">
                        <Link href="/blog" className={styles.backLink}>
                            <ArrowLeft size={20} /> Volver
                        </Link>
                        <span className={styles.categoryBadge}>{article.category}</span>
                        <h1 className={styles.title}>{article.title}</h1>
                        <div className={styles.meta}>
                            <span><Calendar size={16} /> {article.date}</span>
                            <span><User size={16} /> {article.author}</span>
                            <span><Clock size={16} /> 5 min lectura</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) 1fr', gap: '3rem', marginTop: '3rem' }}>
                {/* CONTENIDO PRINCIPAL */}
                <article className={styles.content}>
                    <div className={styles.prose} dangerouslySetInnerHTML={{ __html: article.content }} />

                    {/* TAGS */}
                    <div className={styles.tags}>
                        {article.tags.map(tag => (
                            <span key={tag} className={styles.tag}>#{tag}</span>
                        ))}
                    </div>

                    {/* COMPARTIR */}
                    <div className={styles.shareSection}>
                        <h3>¿Te gustó este artículo?</h3>
                        <button className={styles.shareBtn}>
                            <Share2 size={18} /> Compartir
                        </button>
                    </div>
                </article>

                {/* SIDEBAR CON RELACIONADOS */}
                <aside className={styles.sidebar}>
                    <h3>Leer más sobre {article.category}</h3>
                    <div className={styles.relatedList}>
                        {relatedPosts.map(post => (
                            <Link href={`/blog/${post.slug}`} key={post.id} className={styles.relatedCard}>
                                <img src={post.imageUrl} alt={post.title} />
                                <div>
                                    <h4>{post.title}</h4>
                                    <small>{post.date}</small>
                                </div>
                            </Link>
                        ))}
                        {relatedPosts.length === 0 && <p className={styles.noRelated}>No hay más artículos en esta categoría aún.</p>}
                    </div>

                    <div className={styles.ctaCard}>
                        <h4>¿Buscas {article.category.toLowerCase()}?</h4>
                        <p>Mira nuestras ofertas exclusivas en la tienda.</p>
                        <Link href="/catalogo" className={styles.shopBtn}>Ir a la Tienda</Link>
                    </div>
                </aside>
            </div>
        </div>
    );
}
