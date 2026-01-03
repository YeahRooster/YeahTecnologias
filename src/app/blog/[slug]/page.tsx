'use client';

import { use, useState, useEffect } from 'react';
import { getPostBySlug, getRelatedPosts } from '@/data/blogPosts';
import { ArrowLeft, Calendar, Clock, Share2, Heart } from 'lucide-react';
import Link from 'next/link';
import styles from './article.module.css';

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const article = getPostBySlug(slug);

    const [liked, setLiked] = useState(false);

    useEffect(() => {
        // Verificar si ya le dio like antes
        const storedLikes = JSON.parse(localStorage.getItem('blog_likes') || '{}');
        if (storedLikes[slug]) {
            setLiked(true);
        }
    }, [slug]);

    const handleLike = () => {
        const storedLikes = JSON.parse(localStorage.getItem('blog_likes') || '{}');
        const newValue = !liked;

        if (newValue) {
            storedLikes[slug] = true;
        } else {
            delete storedLikes[slug];
        }

        localStorage.setItem('blog_likes', JSON.stringify(storedLikes));
        setLiked(newValue);
    };

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
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleLike}
                                className={styles.shareBtn}
                                style={{
                                    background: liked ? '#ef4444' : 'white',
                                    color: liked ? 'white' : '#ef4444',
                                    border: '1px solid #ef4444'
                                }}
                            >
                                <Heart size={18} fill={liked ? "white" : "none"} /> {liked ? 'Te gusta' : 'Me gusta'}
                            </button>
                            <button className={styles.shareBtn}>
                                <Share2 size={18} /> Compartir
                            </button>
                        </div>
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
