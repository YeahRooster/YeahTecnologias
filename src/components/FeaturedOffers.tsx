'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
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

export default function FeaturedOffers() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

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

        async function fetchProducts() {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data = await res.json();

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

                    // Filtrar productos con descuento o con tag de OFERTA/HOT
                    const offers = normalized.filter((p: Product) => 
                        (p.originalPrice && p.originalPrice > p.price) ||
                        (p.tags && p.tags.some(t => ['OFERTA', 'HOT', 'PROMO'].includes(t.toUpperCase())))
                    );

                    setProducts(offers.slice(0, 8));
                }
            } catch (error) {
                console.error("Error cargando ofertas destacadas:", error);
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

    if (loading || products.length === 0) return null;

    return (
        <section className={styles.section} style={{ backgroundColor: '#ffffff' }}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Flame size={26} color="#ea580c" /> Ofertas y Oportunidades
                    </h2>
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
