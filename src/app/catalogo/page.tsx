'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { Filter, Loader2, X, Lock } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string;
    category: string;
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
                    stock: parseInt(item.stock !== undefined ? item.stock : '100')
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
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
                    {searchQuery ? `Búsqueda: "${searchQuery}"` : 'Catálogo Mayorista'}
                </h1>
            </div>

            {/* BANNER DE ACCESO */}
            {!isAuthorized && (
                <div style={{
                    background: userStatus === 'pending'
                        ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                        : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    border: `1px solid ${userStatus === 'pending' ? '#fde68a' : '#bae6fd'}`,
                    padding: '2rem',
                    borderRadius: '1rem',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}>
                    {userStatus === 'pending' ? (
                        <>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⌛</div>
                            <h2 style={{ color: '#92400e', marginBottom: '0.5rem' }}>Cuenta en Proceso de Aprobación</h2>
                            <p style={{ color: '#b45309', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
                                ¡Gracias por registrarte! Un administrador está revisando tus datos.
                                En breve recibirás un email confirmando la habilitación para ver precios y comprar.
                            </p>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏢</div>
                            <h2 style={{ color: '#075985', marginBottom: '0.5rem' }}>Precios Exclusivos Mayoristas</h2>
                            <p style={{ color: '#0369a1', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
                                Solo los clientes habilitados pueden ver nuestra lista de precios y realizar pedidos online.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <a href="/cuenta" style={{
                                    background: '#4f46e5', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, textDecoration: 'none'
                                }}>Ingresar</a>
                                <a href="/cuenta" style={{
                                    background: 'white', color: '#4f46e5', border: '1px solid #4f46e5', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, textDecoration: 'none'
                                }}>Registrarme</a>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* BARRA DE FILTROS */}
            <div style={{
                marginBottom: '2rem',
                backgroundColor: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem'
            }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Categoría</label>
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                {isAuthorized && (
                    <div style={{ flex: '1.5', minWidth: '250px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Rango de Precio</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input type="number" placeholder="Mín" value={minPrice} onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                            <span>-</span>
                            <input type="number" placeholder="Máx" value={maxPrice} onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                        </div>
                    </div>
                )}
                <div style={{ flex: '1', minWidth: '180px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Orden</label>
                    <select
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value as any)}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                    >
                        <option value="default">Relevancia</option>
                        <option value="asc">Menor Precio</option>
                        <option value="desc">Mayor Precio</option>
                    </select>
                </div>
            </div>

            {/* LAYOUT PRINCIPAL: PRODUCTOS + SIDEBAR */}
            <div className="catalog-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) 300px', gap: '2rem', alignItems: 'start' }}>

                {/* COLUMNA PRODUCTOS */}
                <div style={{ order: 1 }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '2rem'
                    }}>
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
                <aside style={{ order: 2, display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '2rem' }}>

                    {/* Banner ROOSTER (Vertical) */}
                    <a href="https://www.instagram.com/roosterespacio" target="_blank" rel="noopener noreferrer" style={{ display: 'block', transition: 'transform 0.2s', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <img
                            src="/ads/rooster_banner.png"
                            alt="Escuela de Dibujo Rooster"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </a>

                    {/* Banner REXY (Cuadrado) */}
                    <a href="https://instagram.com/rexy.libreria" target="_blank" rel="noopener noreferrer" style={{ display: 'block', transition: 'transform 0.2s', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <img
                            src="/ads/rexy_banner.png"
                            alt="Librería Rexy"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </a>

                </aside>

            </div>

            {/* Responsive Fix: En móvil sidebar baja */}
            <style jsx>{`
                @media (max-width: 1024px) {
                    .catalog-layout {
                        grid-template-columns: 1fr !important;
                    }
                    aside {
                        display: none !important; /* Opcional: Ocultar en móvil para no molestar, o cambiar a grid inferior */
                    }
                }
            `}</style>

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
