'use client';

import { useState, useEffect } from 'react';
import { useFavorites } from "@/context/FavoritesContext";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { Package, Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import styles from "./favoritos.module.css";

export default function FavoritosPage() {
    const { favorites } = useFavorites();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.habilitado) {
                    setIsAuthorized(true);
                }
            } catch (e) { }
        }
    }, []);

    return (
        <div className="container" style={{ padding: '2rem 1rem', minHeight: '70vh' }}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Heart size={32} className={styles.titleIcon} fill="var(--accent)" color="var(--accent)" />
                    <h1 className="section-title" style={{ margin: 0, textAlign: 'left' }}>Mis Favoritos</h1>
                </div>
                <p className={styles.subtitle}>Tu lista personalizada de productos para reposición rápida.</p>
            </div>

            {favorites.length === 0 ? (
                <div className={styles.emptyState}>
                    <Heart size={64} color="#e2e8f0" style={{ marginBottom: '1.5rem' }} />
                    <h2>Tu lista está vacía</h2>
                    <p>Aún no has guardado ningún producto en tus favoritos.</p>
                    <Link href="/catalogo" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                        Explorar Catálogo
                    </Link>
                </div>
            ) : (
                <div className={styles.favoritesGrid}>
                    {favorites.map(product => (
                        <div key={product.id} onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer' }}>
                            <ProductCard product={product} isAuthorized={isAuthorized} />
                        </div>
                    ))}
                </div>
            )}

            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    isAuthorized={isAuthorized}
                />
            )}
        </div>
    );
}
