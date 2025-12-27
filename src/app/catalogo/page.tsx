'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { Filter, Loader2, X } from "lucide-react";

interface Product {
    id: string;
    nombre: string;
    name: string; // Compatibilidad
    description: string;
    precio: number;
    price: number; // Compatibilidad
    stock: boolean;
    imagen: string;
    image: string; // Compatibilidad
    category: string;
    categoria: string; // Compatibilidad
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

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch('/api/products');
                if (!response.ok) throw new Error('Error al cargar productos');
                const data = await response.json();

                // Normalizar datos para asegurar compatibilidad entre español (Google Sheets) e inglés (UI)
                const normalizedData = data.map((item: any) => ({
                    ...item,
                    name: item.nombre || item.name,
                    price: item.precio || item.price,
                    image: item.imagen || item.image,
                    category: item.categoria || item.category,
                    stock: item.stock
                }));

                setProducts(normalizedData);
            } catch (err) {
                setError('No se pudieron cargar los productos. Intenta nuevamente.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    // Obtener categorías únicas (soportando múltiples separadas por coma)
    const allCategories = products
        .map(p => p.category)
        .filter(Boolean)
        .flatMap(cat => cat.split(',').map(c => c.trim()));

    const categories = ['Todas', ...Array.from(new Set(allCategories))].sort();

    // Filtrar productos
    let filteredProducts = products.filter(p => {
        // Categoría
        const productCategories = p.category ? p.category.split(',').map(c => c.trim()) : [];
        const matchesCategory = selectedCategory === 'Todas' || productCategories.includes(selectedCategory);

        // Búsqueda
        const matchesSearch = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());

        // Precio
        const matchesMinPrice = minPrice === '' || p.price >= minPrice;
        const matchesMaxPrice = maxPrice === '' || p.price <= maxPrice;

        return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
    });

    // Ordenar
    if (sortOrder === 'asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Cargando productos...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--error)' }}>{error}</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            {/* Header del Catálogo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0, textAlign: 'left' }}>
                        {searchQuery ? `Resultados para "${searchQuery}"` : 'Catálogo Completo'}
                    </h1>
                    {searchQuery && (
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {!searchQuery && `${filteredProducts.length} productos encontrados`}
                </p>
            </div>

            {/* BARRA DE HERRAMIENTAS DE FILTRO */}
            <div style={{
                marginBottom: '2rem',
                backgroundColor: '#f8fafc',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                alignItems: 'flex-end'
            }}>
                {/* Categoría */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Categoría</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{
                            padding: '0.6rem 2.5rem 0.6rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            minWidth: '200px',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.5rem center',
                            backgroundSize: '1.25rem',
                            appearance: 'none',
                            borderRight: '10px solid transparent' // Hack simple para flecha
                        }}
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Precio */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Rango de Precio</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="number"
                            placeholder="Mín"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                            style={{ width: '100px', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>-</span>
                        <input
                            type="number"
                            placeholder="Máx"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                            style={{ width: '100px', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                        />
                    </div>
                </div>

                {/* Ordenar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ordenar por</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        style={{
                            padding: '0.6rem 2.5rem 0.6rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            minWidth: '180px',
                            appearance: 'none'
                        }}
                    >
                        <option value="default">Relevancia</option>
                        <option value="asc">Menor Precio</option>
                        <option value="desc">Mayor Precio</option>
                    </select>
                </div>
            </div>

            {/* GRID DE PRODUCTOS */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '2rem'
            }}>
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        style={{ cursor: 'pointer' }}
                        title="Clic para ver detalles"
                    >
                        <ProductCard product={{
                            ...product,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            category: product.category,
                            stock: product.stock ? 1 : 0 // Adaptador simple
                        }} />
                    </div>
                ))}
            </div>

            {/* EMPTY STATE */}
            {filteredProducts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <p>No hay productos que coincidan con tu búsqueda.</p>
                    {searchQuery && (
                        <p style={{ marginTop: '1rem' }}>
                            <a href="/catalogo" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                                Ver todos los productos
                            </a>
                        </p>
                    )}
                </div>
            )}

            {/* MODAL DE DETALLE */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
}

export default function CatalogPage() {
    return (
        <Suspense fallback={
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Cargando...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        }>
            <CatalogContent />
        </Suspense>
    );
}
