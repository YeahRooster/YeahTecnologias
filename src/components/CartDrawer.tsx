'use client';

import { useCart } from '@/context/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
    const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

    if (!isCartOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={() => setIsCartOpen(false)} />
            <div className={styles.drawer}>
                <div className={styles.header}>
                    <h2>
                        <ShoppingBag size={24} /> Carrito ({totalItems})
                    </h2>
                    <button onClick={() => setIsCartOpen(false)} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className={styles.empty}>
                        <ShoppingBag size={64} />
                        <p>Tu carrito está vacío</p>
                        <button onClick={() => setIsCartOpen(false)} className={styles.continueBtn}>
                            Seguir comprando
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.items}>
                            {items.map(item => (
                                <div key={item.id} className={styles.item}>
                                    <div className={styles.itemImage}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} />
                                        ) : (
                                            <div className={styles.noImage}>Sin imagen</div>
                                        )}
                                    </div>
                                    <div className={styles.itemDetails}>
                                        <h3>{item.name}</h3>
                                        <p className={styles.itemPrice}>${item.price.toLocaleString('es-AR')}</p>
                                        <div className={styles.quantityControls}>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className={styles.qtyBtn}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className={styles.quantity}>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className={styles.qtyBtn}
                                                disabled={item.quantity >= item.maxStock}
                                            >
                                                <Plus size={16} />
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className={styles.removeBtn}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.itemSubtotal}>
                                        ${(item.price * item.quantity).toLocaleString('es-AR')}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.footer}>
                            <div className={styles.total}>
                                <span>Total:</span>
                                <strong>${totalPrice.toLocaleString('es-AR')}</strong>
                            </div>
                            <Link href="/checkout" className={styles.checkoutBtn} onClick={() => setIsCartOpen(false)}>
                                Finalizar Pedido
                            </Link>
                            <button onClick={() => setIsCartOpen(false)} className={styles.continueShoppingBtn}>
                                Seguir Comprando
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
