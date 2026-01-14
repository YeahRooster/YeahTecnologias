'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { Filter, Loader2, X, Lock } from "lucide-react";
import styles from './catalogo.module.css';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string;
    category: string;
    originalPrice?: number;
    tags?: string[];
}

function CatalogContent() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('buscar') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
    const [minPrice, setMinPrice] = useState<number | ''>('');
    const [maxPrice, setMaxPrice] = useState<number | ''>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'default'>('default');

    // Estado para el Modal
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Estado de Autorización (para ver precios)
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userStatus, setUserStatus] = useState<'guest' | 'pending' | 'active'>('guest');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.habilitado) {
                    setIsAuthorized(true);
                    setUserStatus('active');
                } else {
                    setIsAuthorized(false);
                    setUserStatus('pending');
                }
            } catch (e) {
                setIsAuthorized(false);
                setUserStatus('guest');
            }
        } else {
            setIsAuthorized(false);
            setUserStatus('guest');
        }
    }, []);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const response = await fetch('/api/products');
                if (!response.ok) throw new Error('Error al cargar productos');
                const data = await response.json();

                // Normalizar datos
                const normalizedData = data.map((item: any) => ({
                    id: item.id || '',
                    name: item.nombre || item.name || '',
                    description: item.descripcion || item.description || '',
                    price: parseFloat(item.precio || item.price || '0'),
                    image: item.imagen || item.image || item.imageUrl || '',
                    category: item.categoria || item.category || '',
                    stock: parseInt(item.stock !== undefined ? item.stock : '100'),
                    originalPrice: parseFloat(item.originalPrice || '0'),
                    tags: Array.isArray(item.tags) ? item.tags : []
                }));

                setProducts(normalizedData.reverse());
            } catch (err) {
                setError('No se pudieron cargar los productos. Intenta nuevamente.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    // Categorías únicas
    const allCategories = products
        .map(p => p.category)
        .filter(Boolean)
        .flatMap(cat => cat.split(',').map(c => c.trim()));

    const categories = ['Todas', ...Array.from(new Set(allCategories))].sort();

    // Filtros
    let filteredProducts = products.filter(p => {
        const productCategories = p.category ? p.category.split(',').map(c => c.trim()) : [];
        const matchesCategory = selectedCategory === 'Todas' || productCategories.includes(selectedCategory);

        const matchesSearch = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesMinPrice = minPrice === '' || p.price >= minPrice;
        const matchesMaxPrice = maxPrice === '' || p.price <= maxPrice;

        return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
    });

    if (sortOrder === 'asc') filteredProducts.sort((a, b) => a.price - b.price);
    if (sortOrder === 'desc') filteredProducts.sort((a, b) => b.price - a.price);

    if (loading) return (
        <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
            <Loader2 size={48} className="spin" />
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Cargando catálogo...</p>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>

            {/* Header */}
            <div className={styles.catalogHeader}>
                <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
                    {searchQuery ? `Búsqueda: "${searchQuery}"` : 'Catálogo Mayorista'}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>{filteredProducts.length} productos disponibles</p>
            </div>

            {/* BANNER DE ACCESO */}
            {!isAuthorized && (
                <div className={`${styles.authBanner} ${userStatus === 'pending' ? styles.authBannerPending : styles.authBannerGuest}`}>
                    {userStatus === 'pending' ? (
                        <>
                            <div className={styles.authIcon}>⌛</div>
                            <h2 className={`${styles.authTitle} ${styles.authPendingTitle}`}>Cuenta en Proceso de Aprobación</h2>
                            <p className={`${styles.authText} ${styles.authPendingText}`}>
                                ¡Gracias por registrarte! Un administrador está revisando tus datos.
                                En breve recibirás un email confirmando la habilitación para ver precios y comprar.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className={styles.authIcon}>🏢</div>
                            <h2 className={`${styles.authTitle} ${styles.authGuestTitle}`}>Precios Exclusivos Mayoristas</h2>
                            <p className={`${styles.authText} ${styles.authGuestText}`}>
                                Solo los clientes habilitados pueden ver nuestra lista de precios y realizar pedidos online.
                            </p>
                            <div className={styles.authActions}>
                                <a href="/cuenta" className="btn btn-primary">Ingresar</a>
                                <a href="/cuenta" className="btn btn-outline">Registrarme</a>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* BARRA DE FILTROS */}
            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Categoría</label>
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className={styles.filterSelect}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                {isAuthorized && (
                    <div className={styles.filterGroup} style={{ flex: '1.5' }}>
                        <label className={styles.filterLabel}>Rango de Precio</label>
                        <div className={styles.priceRangeInputs}>
                            <input type="number" placeholder="Mín" value={minPrice} onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : '')} className={styles.filterInput} />
                            <span>-</span>
                            <input type="number" placeholder="Máx" value={maxPrice} onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : '')} className={styles.filterInput} />
                        </div>
                    </div>
                )}
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Orden</label>
                    <select
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value as any)}
                        className={styles.filterSelect}
                    >
                        <option value="default">Relevancia</option>
                        <option value="asc">Menor Precio</option>
                        <option value="desc">Mayor Precio</option>
                    </select>
                </div>
            </div>

            {/* LAYOUT PRINCIPAL: PRODUCTOS + SIDEBAR */}
            <div className={styles.catalogGrid}>

                {/* COLUMNA PRODUCTOS */}
                <div>
                    <div className={styles.productsGrid}>
                        {filteredProducts.map(product => (
                            <div key={product.id} onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer' }}>
                                <ProductCard product={product} isAuthorized={isAuthorized} />
                            </div>
                        ))}
                    </div>

                    {/* EMPTY STATE */}
                    {filteredProducts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                            <p style={{ fontSize: '1.2rem' }}>No se encontraron productos con estos filtros.</p>
                        </div>
                    )}
                </div>

                {/* SIDEBAR PUBLICIDAD */}
                <aside className={styles.sidebar}>

                    {/* Banner ROOSTER (Vertical) */}
                    <a href="https://www.instagram.com/roosterespacio" target="_blank" rel="noopener noreferrer" className={styles.adBanner}>
                        <img
                            src="/ads/rooster_banner.png"
                            alt="Escuela de Dibujo Rooster"
                            className={styles.adImg}
                        />
                    </a>

                    {/* Banner REXY (Cuadrado) */}
                    <a href="https://instagram.com/rexy.libreria" target="_blank" rel="noopener noreferrer" className={styles.adBanner}>
                        <img
                            src="/ads/rexy_banner.png"
                            alt="Librería Rexy"
                            className={styles.adImg}
                        />
                    </a>

                </aside>

            </div>

            {/* MODAL */}
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

export default function CatalogPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '5rem' }}>Cargando catálogo...</div>}>
            <CatalogContent />
        </Suspense>
    );
}
