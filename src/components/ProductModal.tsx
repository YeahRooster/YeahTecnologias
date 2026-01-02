'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Check, X, Bell } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./ProductModal.module.css";

interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
    category: string;
    stock?: number;
    description?: string;
}

interface ProductModalProps {
    product: Product;
    onClose: () => void;
    isAuthorized?: boolean;
}

export default function ProductModal({ product, onClose, isAuthorized = false }: ProductModalProps) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    const maxStock = product.stock || 0;
    const outOfStock = maxStock <= 0;

    const handleAddToCart = () => {
        if (outOfStock) return;

        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            maxStock: maxStock,
        }, quantity);

        setAdded(true);
        setTimeout(() => {
            setAdded(false);
        }, 1500);
    };

    // Cerrar con Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={24} />
                </button>

                <div className={styles.grid}>
                    <div className={styles.imageSection}>
                        {product.image ? (
                            <img src={product.image} alt={product.name} className={styles.mainImage} />
                        ) : (
                            <div className={styles.placeholder}>Sin Imagen</div>
                        )}
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.category}>{product.category}</div>
                        <h2 className={styles.title}>{product.name}</h2>

                        {isAuthorized ? (
                            <div className={styles.price}>${product.price.toLocaleString('es-AR')}</div>
                        ) : (
                            <div className={styles.lockedPriceMain}>
                                <span className={styles.blurredPriceLarge}>$ 00.000,00</span>
                                <div className={styles.lockNotice}>
                                    🔒 Debes estar logueado y habilitado por el administrador para ver precios mayoristas.
                                </div>
                            </div>
                        )}

                        <div className={styles.description}>
                            {product.description || 'Sin descripción disponible.'}
                        </div>

                        {product.stock !== undefined && isAuthorized && (
                            <div className={styles.stockInfo}>
                                Stock disponible: <span className={product.stock > 0 ? styles.inStock : styles.noStock}>
                                    {product.stock > 0 ? product.stock : 'Agotado'}
                                </span>
                            </div>
                        )}

                        {isAuthorized && !outOfStock && (
                            <div className={styles.actions}>
                                <div className={styles.quantitySelector}>
                                    <button
                                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                        className={styles.qtyBtn}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className={styles.qtyValue}>{quantity}</span>
                                    <button
                                        onClick={() => quantity < maxStock && setQuantity(quantity + 1)}
                                        className={styles.qtyBtn}
                                        disabled={quantity >= maxStock}
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <button
                                    className={`${styles.addButton} ${added ? styles.added : ''}`}
                                    onClick={handleAddToCart}
                                    disabled={added}
                                >
                                    {added ? (
                                        <>
                                            <Check size={20} /> Agregado al carrito
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={20} /> Agregar al Carrito
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {isAuthorized && outOfStock && (
                            <div className={styles.outOfStockMessage}>
                                <Bell size={20} />
                                <span>Este producto no tiene stock actualmente.</span>
                            </div>
                        )}

                        {!isAuthorized && (
                            <div className={styles.registerPrompt}>
                                <p>¿Eres cliente mayorista?</p>
                                <a href="/cuenta" className={styles.loginLink}>Inicia sesión o regístrate aquí</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
