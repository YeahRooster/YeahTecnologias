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
            </div>
            <div className={styles.content}>
                <span className={styles.category}>{product.category}</span>
                <h3 className={styles.title}>{product.name}</h3>



                <div className={styles.priceRow}>
                    {isAuthorized ? (
                        <span className={styles.price}>${product.price.toLocaleString('es-AR')}</span>
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
