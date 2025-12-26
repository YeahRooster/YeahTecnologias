'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './checkout.module.css';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, clearCart } = useCart();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleSubmit = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (items.length === 0) {
            setError('El carrito está vacío');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    products: items.map(item => ({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    total: totalPrice,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al procesar el pedido');
            }

            setOrderId(data.orderId);
            setSuccess(true);
            clearCart();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.successContainer}>
                <div className={styles.successCard}>
                    <CheckCircle size={64} className={styles.successIcon} />
                    <h1>¡Pedido Confirmado!</h1>
                    <p>Tu pedido ha sido registrado correctamente.</p>
                    <div className={styles.orderId}>
                        <span>Número de pedido:</span>
                        <strong>{orderId}</strong>
                    </div>
                    <p className={styles.infoText}>
                        Nos pondremos en contacto contigo para coordinar el envío y el pago.
                    </p>
                    <div className={styles.successActions}>
                        <Link href="/cuenta" className={styles.viewOrderBtn}>
                            Ver Mis Pedidos
                        </Link>
                        <Link href="/catalogo" className={styles.continueBtn}>
                            Seguir Comprando
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0 && !success) {
        return (
            <div className={styles.emptyContainer}>
                <h1>Carrito Vacío</h1>
                <p>No tenés productos en tu carrito.</p>
                <Link href="/catalogo" className={styles.continueBtn}>
                    Ir al Catálogo
                </Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <Link href="/catalogo" className={styles.backLink}>
                <ArrowLeft size={18} /> Volver al catálogo
            </Link>

            <h1 className={styles.title}>Finalizar Pedido</h1>

            <div className={styles.checkoutGrid}>
                <div className={styles.orderSummary}>
                    <h2>Resumen del Pedido</h2>
                    <div className={styles.itemsList}>
                        {items.map(item => (
                            <div key={item.id} className={styles.item}>
                                <div className={styles.itemImage}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} />
                                    ) : (
                                        <div className={styles.noImage}>Sin img</div>
                                    )}
                                </div>
                                <div className={styles.itemInfo}>
                                    <h3>{item.name}</h3>
                                    <p>Cantidad: {item.quantity}</p>
                                </div>
                                <div className={styles.itemPrice}>
                                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.totalRow}>
                        <span>Total:</span>
                        <strong>${totalPrice.toLocaleString('es-AR')}</strong>
                    </div>
                </div>

                <div className={styles.checkoutForm}>
                    <h2>Datos de Envío</h2>

                    {!user ? (
                        <div className={styles.loginPrompt}>
                            <AlertCircle size={24} />
                            <p>Para finalizar tu pedido, necesitás iniciar sesión.</p>
                            <Link href="/login" className={styles.loginBtn}>
                                Iniciar Sesión
                            </Link>
                            <p className={styles.registerText}>
                                ¿No tenés cuenta? <Link href="/registro">Registrate acá</Link>
                            </p>
                        </div>
                    ) : (
                        <div className={styles.userInfo}>
                            <div className={styles.infoRow}>
                                <label>Nombre:</label>
                                <span>{user.nombreCompleto}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Email:</label>
                                <span>{user.email}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Teléfono:</label>
                                <span>{user.telefono}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Domicilio:</label>
                                <span>{user.domicilio}, {user.localidad}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>CUIT/CUIL:</label>
                                <span>{user.cuitCuil}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Local:</label>
                                <span>{user.nombreLocal}</span>
                            </div>

                            {error && <div className={styles.error}>{error}</div>}

                            <button
                                onClick={handleSubmit}
                                className={styles.submitBtn}
                                disabled={loading}
                            >
                                {loading ? 'Procesando...' : 'Confirmar Pedido'}
                            </button>

                            <p className={styles.note}>
                                Al confirmar, el pedido quedará registrado y nos comunicaremos para coordinar el pago y envío.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
