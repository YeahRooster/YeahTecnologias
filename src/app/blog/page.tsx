'use client';

import { useState } from 'react';
import { getAllPosts, getAllCategories } from '@/data/blogPosts';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Tag, BookOpen } from 'lucide-react';
import styles from './blog.module.css';

export default function BlogPage() {
    const allPosts = getAllPosts();
    const categories = getAllCategories();
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    const filteredPosts = selectedCategory === 'Todas'
        ? allPosts
        : allPosts.filter(post => post.category === selectedCategory);

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            {/* HERO SECTION DEL BLOG */}
            <div className={styles.blogHero}>
                <div>
                    <h1>Blog de Tecnología & Negocios</h1>
                    <p>Las últimas tendencias, guías de compra y consejos para potenciar tu negocio.</p>
                </div>
            </div>

            <div className={styles.blogLayout}>
                {/* COLUMNA PRINCIPAL - ARTICULOS */}
                <main className={styles.mainColumn}>
                    <div className={styles.postsGrid}>
                        {filteredPosts.map((post) => (
                            <Link href={`/blog/${post.slug}`} key={post.id} className={styles.postCard}>
                                <div className={styles.imageWrapper}>
                                    <img src={post.imageUrl} alt={post.title} />
                                    <span className={styles.badge}>{post.category}</span>
                                </div>
                                <div className={styles.cardContent}>
                                    <div className={styles.meta}>
                                        <span className={styles.metaItem}><Calendar size={14} /> {post.date}</span>
                                        <span className={styles.metaItem}><User size={14} /> {post.author}</span>
                                    </div>
                                    <h3>{post.title}</h3>
                                    <p>{post.excerpt}</p>
                                    <div className={styles.readMore}>
                                        Leer artículo <ArrowRight size={16} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {filteredPosts.length === 0 && (
                        <div className={styles.emptyState}>
                            <p>No hay artículos en esta categoría por el momento.</p>
                        </div>
                    )}
                </main>

                {/* BARRA LATERAL */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarWidget}>
                        <h3> <BookOpen size={20} /> Categorías</h3>
                        <div className={styles.categoryList}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`${styles.catBtn} ${selectedCategory === cat ? styles.activeCat : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={`${styles.sidebarWidget} ${styles.newsletterWidget}`}>
                        <h3>🚀 Potencia tu negocio</h3>
                        <p>Únete a nuestra lista exclusiva para recibir ofertas mayoristas y tips.</p>
                        <Link href="/contacto" className={styles.subscribeBtn}>
                            Contactar Ahora
                        </Link>
                    </div>
                </aside>
            </div>
        </div>
    );
}
