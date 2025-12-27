'use client';

import { useState } from 'react';
import { X, ShoppingCart, ChevronRight, ChevronLeft, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './ProductModal.module.css';

interface Product {
    id: string;
    nombre?: string;
    name?: string;
    precio?: number;
    price?: number;
    categoria?: string;
    category?: string;
    imagen?: string;
    image?: string;
    stock: boolean | number;
    descripcion?: string;
    description?: string;
}

interface ProductModalProps {
    product: Product;
    onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
    const { addToCart } = useCart();

    // Normalizar datos (compatibilidad Español/Inglés)
    const productName = product.nombre || product.name || 'Producto sin nombre';
    const productPrice = product.precio || product.price || 0;
    const productCategory = product.categoria || product.category || 'General';
    const productImage = product.imagen || product.image || '';

    const productDescription = product.descripcion || product.description ||
        "Haz clic en agregar para sumar este producto a tu pedido. Recuerda que los precios finales se confirman al cerrar la compra dependiendo la cotización del día.";

    // Lógica mágica: Separar las imágenes por coma
    const images = productImage
        ? productImage.split(',').map(url => url.trim()).filter(Boolean)
        : ['/placeholder.png'];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    // Determinar stock máximo (si es booleano true -> 9999, si es número -> ese número)
    const maxStock = typeof product.stock === 'number' ? product.stock : (product.stock ? 9999 : 0);

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleQuantityChange = (delta: number) => {
        const newQty = quantity + delta;
        if (newQty >= 1 && newQty <= maxStock) {
            setQuantity(newQty);
        }
    };

    const handleAddToCart = () => {
        if (productPrice <= 0) {
            alert("Error: Precio no válido");
            return;
        }

        addToCart({
            id: product.id,
            name: productName,
            price: productPrice,
            image: images[0],
            quantity: quantity,
            maxStock: maxStock
        });
        // Opcional: Cerrar modal al agregar
        onClose();
    };

    // Cerrar si se clickea fuera del contenido (el fondo oscuro)
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
                    <X size={24} />
                </button>

                <div className={styles.grid}>
                    {/* GALERÍA DE IMÁGENES */}
                    <div className={styles.gallerySection}>
                        <div className={styles.mainImageContainer}>
                            <img
                                src={images[currentImageIndex]}
                                alt={productName}
                                className={styles.mainImage}
                            />
                            {images.length > 1 && (
                                <>
                                    <button onClick={handlePrevImage} className={`${styles.navBtn} ${styles.prevBtn}`}>
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button onClick={handleNextImage} className={`${styles.navBtn} ${styles.nextBtn}`}>
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Miniaturas */}
                        {images.length > 1 && (
                            <div className={styles.thumbnails}>
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`${styles.thumbBtn} ${currentImageIndex === idx ? styles.activeThumb : ''}`}
                                    >
                                        <img src={img} alt={`Vista ${idx + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DATOS DEL PRODUCTO */}
                    <div className={styles.infoSection}>
                        <span className={styles.categoryBadge}>{productCategory}</span>
                        <h2 className={styles.title}>{productName}</h2>

                        <div className={styles.priceRow}>
                            <span className={styles.currency}>$</span>
                            <span className={styles.price}>{productPrice.toLocaleString('es-AR')}</span>
                        </div>

                        <div className={styles.statusRow}>
                            {product.stock ? (
                                <span className={styles.inStock}>✅ Disponible en stock</span>
                            ) : (
                                <span className={styles.noStock}>❌ Sin stock momentáneo</span>
                            )}
                        </div>

                        <p className={styles.description}>
                            {productDescription}
                        </p>

                        {/* SELECTOR DE CANTIDAD */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <span style={{ fontWeight: 600, color: '#64748b' }}>Cantidad:</span>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.5rem',
                                overflow: 'hidden'
                            }}>
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                    style={{ padding: '0.5rem', background: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                    <Minus size={18} />
                                </button>
                                <span style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={quantity >= maxStock}
                                    style={{ padding: '0.5rem', background: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button
                                onClick={handleAddToCart}
                                className={styles.addCartBtn}
                                disabled={!product.stock}
                            >
                                <ShoppingCart size={20} />
                                Agregar al Carrito
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
