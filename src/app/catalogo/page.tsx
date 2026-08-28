'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { Filter, Loader2, X, Lock, Download, Heart } from "lucide-react";
import Link from "next/link";
import { useWhiteLabel } from "@/context/WhiteLabelContext";
import styles from './catalogo.module.css';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string;
    images: string[];
    category: string;
    originalPrice?: number;
    tags?: string[];
}

function CatalogContent() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('buscar') || '';
    const searchTag = searchParams.get('tag') || '';
    const searchCategoria = searchParams.get('categoria') || 'Todas';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>(searchCategoria);
    const [minPrice, setMinPrice] = useState<number | ''>('');
    const [maxPrice, setMaxPrice] = useState<number | ''>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'novedades' | 'default'>('default');
    const [hideOutOfStock, setHideOutOfStock] = useState(false);

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
                    images: Array.isArray(item.images) ? item.images : [item.imagen || item.image || item.imageUrl || ''],
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
            
        const matchesTag = !searchTag || 
            (p.tags && p.tags.some(t => t.toLowerCase() === searchTag.toLowerCase()));

        const matchesMinPrice = minPrice === '' || p.price >= minPrice;
        const matchesMaxPrice = maxPrice === '' || p.price <= maxPrice;
        const matchesStock = !hideOutOfStock || p.stock > 0;

        return matchesCategory && matchesSearch && matchesTag && matchesMinPrice && matchesMaxPrice && matchesStock;
    });

    if (sortOrder === 'asc') filteredProducts.sort((a, b) => a.price - b.price);
    if (sortOrder === 'desc') filteredProducts.sort((a, b) => b.price - a.price);
    if (sortOrder === 'novedades') {
        // Muestra únicamente los últimos 30 productos cargados (los más nuevos primero)
        filteredProducts = filteredProducts.slice(0, 30);
    }

    const { isWhiteLabel, brandName } = useWhiteLabel();

    if (loading) return (
        <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
            <Loader2 size={48} className="spin" />
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Cargando catálogo...</p>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const catalogTitle = searchQuery
        ? `Búsqueda: "${searchQuery}"`
        : searchTag
        ? `Etiqueta: "${searchTag}"`
        : isWhiteLabel
        ? (brandName && brandName !== 'Catálogo Digital' ? `Catálogo - ${brandName}` : 'Catálogo de Productos')
        : 'Catálogo Mayorista';

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>

            {/* Header */}
            <div className={styles.catalogHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className="section-title" style={{ textAlign: 'left', marginBottom: 0 }}>
                    {catalogTitle}
                </h1>

                {isAuthorized && !isWhiteLabel && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link href="/favoritos" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                            <Heart size={18} fill="var(--accent)" color="var(--accent)" /> Mis Favoritos
                        </Link>
                        <Link href="/lista-de-precios" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                            <Download size={18} /> Descargar Lista PDF
                        </Link>
                    </div>
                )}
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
                        <option value="novedades">Novedades (Últimos ingresos)</option>
                        <option value="asc">Menor Precio</option>
                        <option value="desc">Mayor Precio</option>
                    </select>
                </div>
                <div className={styles.switchContainer}>
                    <span className={styles.switchLabelText}>Ocultar sin stock</span>
                    <label className={styles.switch}>
                        <input 
                            type="checkbox" 
                            checked={hideOutOfStock}
                            onChange={e => setHideOutOfStock(e.target.checked)}
                        />
                        <span className={styles.slider}>
                            <span className={styles.sliderKnob}></span>
                        </span>
                    </label>
                </div>
            </div>

            {/* LAYOUT PRINCIPAL: PRODUCTOS + SIDEBAR */}
            <div className={styles.catalogGrid}>

                {/* COLUMNA PRODUCTOS */}
                <div>
                    <div className={styles.productsGrid}>
                        {filteredProducts.map((product, index) => (
                            <div key={`${product.id}-${index}`} onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer' }}>
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
