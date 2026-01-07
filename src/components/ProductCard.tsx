'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Check, Bell } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./ProductCard.module.css";

interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
    category: string;
    stock?: number;
    description?: string;
    originalPrice?: number;
    tags?: string[];
}

interface ProductCardProps {
    product: Product;
    isAuthorized?: boolean;
}

export default function ProductCard({ product, isAuthorized = false }: ProductCardProps) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    const maxStock = product.stock || 0;
    const outOfStock = maxStock <= 0;

    const handleIncrease = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (quantity < maxStock) {
            setQuantity(q => q + 1);
        }
    };

    const handleDecrease = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (quantity > 1) {
            setQuantity(q => q - 1);
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
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
            setQuantity(1);
        }, 1500);
    };

    return (
        <div className={`${styles.card} ${outOfStock ? styles.outOfStock : ''}`}>
            <div className={styles.imageContainer}>
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className={styles.productImage}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <span>Sin imagen</span>
                    </div>
                )}
                {outOfStock && <span className={styles.stockBadge}>Agotado</span>}

                {/* Badges de Etiquetas (NUEVO, HOT, etc) */}
                {!outOfStock && product.tags && product.tags.length > 0 && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {product.tags.map(tag => (
                            <span key={tag} style={{
                                backgroundColor: tag.toUpperCase() === 'NUEVO' ? '#2563eb' :
                                    tag.toUpperCase() === 'HOT' ? '#dc2626' :
                                        tag.toUpperCase() === 'OFERTA' ? '#ea580c' : '#4f46e5',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className={styles.content}>
                <span className={styles.category}>{product.category}</span>
                <h3 className={styles.title}>{product.name}</h3>



                <div className={styles.priceRow}>
                    {isAuthorized ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            {(product.originalPrice ?? 0) > 0 && (product.originalPrice ?? 0) > product.price && (
                                <span style={{
                                    textDecoration: 'line-through',
                                    color: '#94a3b8',
                                    fontSize: '0.85rem',
                                    marginBottom: '-2px'
                                }}>
                                    ${(product.originalPrice ?? 0).toLocaleString('es-AR')}
                                </span>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className={styles.price}>${product.price.toLocaleString('es-AR')}</span>
                                {(product.originalPrice ?? 0) > 0 && (product.originalPrice ?? 0) > product.price && (
                                    <span style={{
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontWeight: 'bold'
                                    }}>
                                        -{Math.round((((product.originalPrice ?? 0) - product.price) / (product.originalPrice || 1)) * 100)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.lockedPrice}>
                            <span className={styles.blurredPrice}>$ 00.000,00</span>
                            <p className={styles.lockText}>Logueate para ver precios</p>
                        </div>
                    )}
                </div>

                {isAuthorized && !outOfStock && (
                    <div className={styles.actions}>
                        <div className={styles.quantitySelector}>
                            <button
                                onClick={handleDecrease}
                                className={styles.qtyBtn}
                                disabled={quantity <= 1}
                            >
                                <Minus size={16} />
                            </button>
                            <span className={styles.qtyValue}>{quantity}</span>
                            <button
                                onClick={handleIncrease}
                                className={styles.qtyBtn}
                                disabled={quantity >= maxStock}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <button
                            className={`${styles.addButton} ${added ? styles.added : ''}`}
                            onClick={handleAddToCart}
                            disabled={added}
                        >
                            {added ? (
                                <>
                                    <Check size={18} /> Agregado
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={18} /> Agregar
                                </>
                            )}
                        </button>
                    </div>
                )}

                {outOfStock && (
                    <button
                        className={`${styles.addButton} ${styles.notifyButton}`}
                        onClick={async () => {
                            let email = '';
                            const userStr = localStorage.getItem('user');
                            if (userStr) {
                                const user = JSON.parse(userStr);
                                email = user.email;
                            } else {
                                const input = window.prompt("Ingresá tu email para avisarte cuando haya stock:");
                                if (input) email = input;
                            }

                            if (email) {
                                try {
                                    const res = await fetch('/api/alerts/stock', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ email, productName: product.name })
                                    });
                                    if (res.ok) {
                                        alert(`✅ ¡Listo! Te avisaremos a ${email} cuando vuelva a entrar.`);
                                    } else {
                                        alert('❌ Hubo un error al guardar tu alerta. Intentá de nuevo.');
                                    }
                                } catch (e) {
                                    alert('❌ Error de conexión.');
                                }
                            }
                        }}
                    >
                        <Bell size={18} /> Avisarme cuando haya
                    </button>
                )}
            </div>
        </div>
    );
}
