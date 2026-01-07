'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Package, Edit3, LogOut, Save, X, Printer, RotateCcw } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './cuenta.module.css';

interface UserData {
    email: string;
    nombreCompleto: string;
    domicilio: string;
    telefono: string;
    cuitCuil: string;
    nombreLocal: string;
    localidad: string;
    fechaRegistro: string;
    habilitado: boolean;
}

interface Order {
    idPedido: string;
    fecha: string;
    productos: string;
    cantidades: string;
    total: number;
    estado: string;
    estadoPago?: string; // Nuevo campo: 'total', 'parcial', 'pendiente'
}

export default function CuentaPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos'>('perfil');
    const [user, setUser] = useState<UserData | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<UserData>>({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Para repetir pedidos
    const { addMultipleToCart } = useCart();
    const [allProducts, setAllProducts] = useState<any[]>([]);

    useEffect(() => {
        // Cargar catálogo silenciosamente para tener precios actualizados al repetir pedido
        fetch('/api/products')
            .then(res => res.json())
            .then(data => setAllProducts(data))
            .catch(err => console.error("Error cargando productos para re-order:", err));
    }, []);

    useEffect(() => {
        // Verificar si hay usuario logueado
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(storedUser);
        fetchUserData(userData.email);
    }, [router]);

    const fetchUserData = async (email: string) => {
        try {
            // Timeout de 30 segundos
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(`/api/user?email=${encodeURIComponent(email)}`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                setOrders(data.orders || []);
                // Sincronizar localStorage con el estado más reciente de Google Sheets
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                console.error('Error en respuesta:', data);
            }
        } catch (error: any) {
            console.error('Error cargando datos:', error);
            if (error.name === 'AbortError') {
                alert('La conexión tardó demasiado. Por favor, verificá tu conexión a internet e intentá nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/');
    };

    const handleEdit = () => {
        setEditData({
            nombreCompleto: user?.nombreCompleto,
            domicilio: user?.domicilio,
            telefono: user?.telefono,
            cuitCuil: user?.cuitCuil,
            nombreLocal: user?.nombreLocal,
            localidad: user?.localidad,
        });
        setEditing(true);
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setEditData({});
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setMessage('');

        try {
            console.log('Enviando actualización:', { email: user.email, ...editData });

            const response = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, ...editData }),
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);

            if (response.ok) {
                setUser({ ...user, ...editData } as UserData);
                setEditing(false);
                setMessage('✅ Datos actualizados correctamente en Google Sheets');
                setTimeout(() => setMessage(''), 5000);
            } else {
                setMessage(`❌ Error: ${data.error || 'No se pudo actualizar'}`);
            }
        } catch (error: any) {
            console.error('Error guardando:', error);
            setMessage(`❌ Error al guardar: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleReorder = (order: Order) => {
        if (!allProducts.length) {
            alert("Espera un momento, cargando catálogo...");
            return;
        }

        const itemsToAdd: any[] = [];
        const missingItems: string[] = [];

        // Parsear string: "Producto A (x2); Producto B (x1)"
        const productStrings = order.productos.split(';').map(s => s.trim());

        productStrings.forEach(str => {
            // Regex para sacar nombre y cantidad: "Nombre del Prod (x5)"
            const match = str.match(/^(.*) \(x(\d+)\)$/);
            if (match) {
                const name = match[1].trim();
                const qty = parseInt(match[2]);

                // Buscar producto en catálogo actual
                const product = allProducts.find(p =>
                    (p.nombre || p.name) === name ||
                    (p.nombre || p.name).toLowerCase() === name.toLowerCase()
                );

                if (product) {
                    itemsToAdd.push({
                        item: {
                            id: product.id,
                            name: product.nombre || product.name,
                            price: parseFloat(product.precio || product.price),
                            image: product.imagen || product.image || product.imageUrl,
                            maxStock: parseInt(product.stock || '0')
                        },
                        quantity: qty
                    });
                } else {
                    missingItems.push(name);
                }
            }
        });

        if (itemsToAdd.length > 0) {
            addMultipleToCart(itemsToAdd);
            let msg = "✅ Productos agregados al carrito.";
            if (missingItems.length > 0) {
                msg += `\n⚠️ No se encontraron (sin stock o descatalogados): ${missingItems.join(', ')}`;
            }
            alert(msg);
        } else {
            alert("❌ No se pudieron encontrar los productos de este pedido en el catálogo actual.");
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <p>Cargando...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div className={styles.header}>
                <h1>Mi Cuenta</h1>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                    <LogOut size={18} /> Cerrar Sesión
                </button>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'perfil' ? styles.active : ''}`}
                    onClick={() => setActiveTab('perfil')}
                >
                    <User size={18} /> Mi Perfil
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'pedidos' ? styles.active : ''}`}
                    onClick={() => setActiveTab('pedidos')}
                >
                    <Package size={18} /> Mis Pedidos ({orders.length})
                </button>
            </div>

            {message && <div className={styles.successMessage}>{message}</div>}

            {activeTab === 'perfil' && (
                <div className={styles.profileCard}>
                    <div className={styles.cardHeader}>
                        <h2>Datos de la Cuenta</h2>
                        {!editing ? (
                            <button onClick={handleEdit} className={styles.editBtn}>
                                <Edit3 size={18} /> Editar
                            </button>
                        ) : (
                            <div className={styles.editActions}>
                                <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                                    <Save size={18} /> {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button onClick={handleCancelEdit} className={styles.cancelBtn}>
                                    <X size={18} /> Cancelar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.profileGrid}>
                        <div className={styles.infoGroup}>
                            <label>Email</label>
                            <p>{user.email}</p>
                        </div>

                        <div className={styles.infoGroup}>
                            <label>Nombre Completo</label>
                            {editing ? (
                                <input
                                    type="text"
                                    name="nombreCompleto"
                                    value={editData.nombreCompleto || ''}
                                    onChange={handleChange}
                                />
                            ) : (
                                <p>{user.nombreCompleto}</p>
                            )}
                        </div>

                        <div className={styles.infoGroup}>
                            <label>Teléfono</label>
                            {editing ? (
                                <input
                                    type="text"
                                    name="telefono"
                                    value={editData.telefono || ''}
                                    onChange={handleChange}
                                />
                            ) : (
                                <p>{user.telefono}</p>
                            )}
                        </div>

                        <div className={styles.infoGroup}>
                            <label>CUIT / CUIL</label>
                            {editing ? (
                                <input
                                    type="text"
                                    name="cuitCuil"
                                    value={editData.cuitCuil || ''}
                                    onChange={handleChange}
                                />
                            ) : (
                                <p>{user.cuitCuil}</p>
                            )}
                        </div>

                        <div className={styles.infoGroup}>
                            <label>Nombre del Local</label>
                            {editing ? (
                                <input
                                    type="text"
                                    name="nombreLocal"
                                    value={editData.nombreLocal || ''}
                                    onChange={handleChange}
                                />
                            ) : (
                                <p>{user.nombreLocal}</p>
                            )}
                        </div>

                        <div className={styles.infoGroup}>
                            <label>Domicilio</label>
                            {editing ? (
                                <input
                                    type="text"
                                    name="domicilio"
                                    value={editData.domicilio || ''}
                                    onChange={handleChange}
                                />
                            ) : (
                                <p>{user.domicilio}</p>
                            )}
                        </div>

                        <div className={styles.infoGroup}>
                            <label>Localidad</label>
                            {editing ? (
                                <input
                                    type="text"
                                    name="localidad"
                                    value={editData.localidad || ''}
                                    onChange={handleChange}
                                />
                            ) : (
                                <p>{user.localidad}</p>
                            )}
                        </div>

                        <div className={styles.infoGroup}>
                            <label>Fecha de Registro</label>
                            <p>{user.fechaRegistro}</p>
                        </div>

                        <div className={styles.infoGroup}>
                            <label>Estado de Acceso Mayorista</label>
                            <span className={user.habilitado ? styles.statusActive : styles.statusPending}>
                                {user.habilitado ? '✅ Habilitado (Puedes ver precios)' : '⌛ Pendiente de Aprobación'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'pedidos' && (
                <div className={styles.ordersSection}>
                    {orders.length === 0 ? (
                        <div className={styles.noOrders}>
                            <Package size={48} />
                            <h3>No tenés pedidos todavía</h3>
                            <p>Cuando hagas tu primer pedido, aparecerá aquí.</p>
                        </div>
                    ) : (
                        <div className={styles.ordersList}>
                            {orders.map((order) => (
                                <div key={order.idPedido} className={styles.orderCard}>
                                    <div className={styles.orderHeader}>
                                        <span className={styles.orderId}>{order.idPedido}</span>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {/* Badge de Estado del Pedido */}
                                            <span className={`${styles.orderStatus} ${styles[order.estado.toLowerCase()]}`}>
                                                {order.estado}
                                            </span>

                                            {/* Badge de Estado de Pago (Si existe) */}
                                            {order.estadoPago && (
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    backgroundColor: ['total', 'pagado', 'completo'].includes(order.estadoPago.toLowerCase()) ? '#dcfce7' :
                                                        order.estadoPago.toLowerCase().includes('parcial') ? '#fef9c3' : '#fee2e2',
                                                    color: ['total', 'pagado', 'completo'].includes(order.estadoPago.toLowerCase()) ? '#166534' :
                                                        order.estadoPago.toLowerCase().includes('parcial') ? '#854d0e' : '#991b1b',
                                                    border: `1px solid ${['total', 'pagado', 'completo'].includes(order.estadoPago.toLowerCase()) ? '#22c55e' :
                                                        order.estadoPago.toLowerCase().includes('parcial') ? '#eab308' : '#ef4444'}`
                                                }}>
                                                    Pago: {order.estadoPago}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.orderDate}>{order.fecha}</div>
                                    <div className={styles.orderProducts}>
                                        <strong>Productos:</strong> {order.productos}
                                    </div>
                                    <div className={styles.orderTotal}>
                                        Total: <strong>${order.total.toLocaleString('es-AR')}</strong>
                                    </div>
                                    <div style={{ marginTop: '15px' }}>
                                        <a href={`/comprobante/${order.idPedido}`} target="_blank" className={styles.printLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#4f46e5', fontWeight: 600, fontSize: '0.9rem' }}>
                                            <Printer size={16} /> Imprimir Comprobante
                                        </a>
                                        <button
                                            onClick={() => handleReorder(order)}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                background: 'none', border: 'none', color: '#16a34a',
                                                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                                                marginLeft: '15px'
                                            }}
                                        >
                                            <RotateCcw size={16} /> Repetir Pedido
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
