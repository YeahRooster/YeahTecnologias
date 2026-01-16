'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import styles from './NewArrivals.module.css';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    images?: string[];
    category: string;
    stock: number;
    description: string;
    originalPrice?: number;
    tags?: string[];
}

export default function NewArrivals() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Verificar autorización (mismo que Header)
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.habilitado) {
                    setIsAuthorized(true);
                }
            } catch (e) { }
        }

        // Cargar productos
        async function fetchProducts() {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data = await res.json();

                    // Normalizar y tomar los últimos 8
                    const normalized = data.map((item: any) => ({
                        id: item.id || '',
                        name: item.name || '',
                        description: item.description || '',
                        price: parseFloat(item.price || '0'),
                        image: item.image || '',
                        images: item.images || [item.image],
                        category: item.category || '',
                        stock: parseInt(item.stock !== undefined ? item.stock : '0'),
                        originalPrice: parseFloat(item.originalPrice || '0'),
                        tags: Array.isArray(item.tags) ? item.tags : []
                    }));

                    // Invertir para que los últimos agregados estén primero
                    setProducts(normalized.reverse().slice(0, 8));
                }
            } catch (error) {
                console.error("Error cargando novedades:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            scrollRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading) return null;
    if (products.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 0 }}>Novedades</h2>
                    <div className={styles.controls}>
                        <button onClick={() => scroll('left')} className={styles.controlBtn} aria-label="Anterior">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={() => scroll('right')} className={styles.controlBtn} aria-label="Siguiente">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                <div className={styles.sliderWrapper}>
                    <div className={styles.slider} ref={scrollRef}>
                        {products.map((product) => (
                            <div key={product.id} className={styles.productItem} onClick={() => setSelectedProduct(product)}>
                                <ProductCard
                                    product={product}
                                    isAuthorized={isAuthorized}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    isAuthorized={isAuthorized}
                />
            )}
        </section>
    );
}
