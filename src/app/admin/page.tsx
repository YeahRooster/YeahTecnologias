'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Filter, X, Save, AlertTriangle, Printer } from 'lucide-react';
import styles from './admin.module.css';

interface Order {
    idPedido: string;
    email: string;
    fecha: string;
    productos: string;
    cantidades: string;
    total: number;
    estado: string;
}

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('Todos');

    // Estado para el modal de detalle
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');

    // Cargar contraseña guardada si existe (opcional, por comodidad en dev)
    useEffect(() => {
        // const savedPwd = localStorage.getItem('adminPwd');
        // if (savedPwd) setPassword(savedPwd);
    }, []);

    const fetchOrders = async (pwd: string) => {
        setLoading(true);
        setError('');
        try {
            // IMPORTANTE: cache: 'no-store' evita que el navegador guarde datos viejos
            const response = await fetch(`/api/admin?password=${encodeURIComponent(pwd)}`, { cache: 'no-store' });

            if (!response.ok) {
                throw new Error('Contraseña incorrecta');
            }

            const data = await response.json();
            setOrders(data.orders);
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await fetchOrders(password);
        if (success) {
            setIsAuthenticated(true);
            // localStorage.setItem('adminPwd', password);
        }
    };

    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
        setNewStatus(order.estado);
        setUpdateMessage('');
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;

        setUpdating(true);
        setUpdateMessage('');

        try {
            const response = await fetch('/api/admin', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: selectedOrder.idPedido,
                    status: newStatus,
                    password: password // Enviar password para validar
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setUpdateMessage('✅ Estado actualizado correctamente');
                // Actualizar lista local
                setOrders(orders.map(o =>
                    o.idPedido === selectedOrder.idPedido ? { ...o, estado: newStatus } : o
                ));
                // Actualizar modal
                setSelectedOrder({ ...selectedOrder, estado: newStatus });

                // Cerrar modal después de 1.5s
                setTimeout(() => {
                    setSelectedOrder(null);
                    setUpdateMessage('');
                }, 1500);
            } else {
                setUpdateMessage(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            setUpdateMessage('❌ Error de conexión');
        } finally {
            setUpdating(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.idPedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.productos.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEstado = filterEstado === 'Todos' || order.estado === filterEstado;

        return matchesSearch && matchesEstado;
    });

    // Métricas calculadas
    const ordersNotCancelled = orders.filter(o => o.estado !== 'Cancelado');
    const totalVentas = ordersNotCancelled.reduce((sum, order) => sum + order.total, 0);
    const ticketPromedio = ordersNotCancelled.length > 0 ? totalVentas / ordersNotCancelled.length : 0;

    // Productos más vendidos
    const productSales: { [key: string]: number } = {};
    orders.forEach(order => {
        if (order.estado === 'Cancelado') return;
        const items = order.productos.split(';');
        items.forEach(item => {
            const match = item.match(/(.+)\s\(x(\d+)\)/);
            if (match) {
                const productName = match[1].trim();
                const quantity = parseInt(match[2]);
                productSales[productName] = (productSales[productName] || 0) + quantity;
            }
        });
    });
    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Pedidos por estado
    const ordersByStatus = {
        Pendiente: orders.filter(o => o.estado === 'Pendiente').length,
        Preparado: orders.filter(o => o.estado === 'Preparado').length,
        Entregado: orders.filter(o => o.estado === 'Entregado').length,
        Cancelado: orders.filter(o => o.estado === 'Cancelado').length,
    };

    const estados = ['Todos', 'Pendiente', 'Preparado', 'Entregado', 'Cancelado'];

    if (!isAuthenticated) {
        return (
            <div className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <h1>🔐 Panel de Administrador</h1>
                    <p>Yeah! Tecnologías</p>

                    {error && <div className={styles.error}>{error}</div>}

                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <input
                            type="password"
                            placeholder="Contraseña de administrador"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Verificando...' : 'Ingresar'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div className={styles.header}>
                <h1>📊 Panel de Administrador</h1>
                <button onClick={() => setIsAuthenticated(false)} className={styles.logoutBtn}>
                    Cerrar Sesión
                </button>
            </div>

            {/* DASHBOARD DE MÉTRICAS */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <Package size={32} />
                    <div>
                        <h3>Total Pedidos</h3>
                        <p className={styles.statNumber}>{orders.length}</p>
                        <span className={styles.statSubtext}>
                            {ordersByStatus.Cancelado} cancelados
                        </span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div>💰</div>
                    <div>
                        <h3>Ventas Totales</h3>
                        <p className={styles.statNumber}>${totalVentas.toLocaleString('es-AR')}</p>
                        <span className={styles.statSubtext}>
                            Excluyendo cancelados
                        </span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div>📈</div>
                    <div>
                        <h3>Ticket Promedio</h3>
                        <p className={styles.statNumber}>${ticketPromedio.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
                        <span className={styles.statSubtext}>
                            Por pedido
                        </span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div>✅</div>
                    <div>
                        <h3>Pedidos Entregados</h3>
                        <p className={styles.statNumber}>{ordersByStatus.Entregado}</p>
                        <span className={styles.statSubtext}>
                            {ordersByStatus.Preparado} preparados
                        </span>
                    </div>
                </div>
            </div>

            {/* PRODUCTOS MÁS VENDIDOS */}
            {topProducts.length > 0 && (
                <div className={styles.topProductsSection}>
                    <h2>🏆 Productos Más Vendidos</h2>
                    <div className={styles.topProductsGrid}>
                        {topProducts.map(([product, qty], index) => (
                            <div key={product} className={styles.topProductCard}>
                                <div className={styles.productRank}>#{index + 1}</div>
                                <div className={styles.productInfo}>
                                    <p className={styles.productName}>{product}</p>
                                    <p className={styles.productQty}>{qty} unidades vendidas</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por pedido, email o producto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.filters}>
                    {estados.map(estado => (
                        <button
                            key={estado}
                            onClick={() => setFilterEstado(estado)}
                            className={filterEstado === estado ? styles.activeFilter : ''}
                        >
                            {estado}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.ordersTable}>
                <table>
                    <thead>
                        <tr>
                            <th>ID Pedido</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.idPedido} onClick={() => handleOrderClick(order)}>
                                <td><strong>{order.idPedido}</strong></td>
                                <td>{order.fecha}</td>
                                <td>{order.email}</td>
                                <td><strong>${order.total.toLocaleString('es-AR')}</strong></td>
                                <td>
                                    <span className={`${styles.badge} ${styles[order.estado.toLowerCase()] || styles.pendiente}`}>
                                        {order.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredOrders.length === 0 && (
                    <div className={styles.noResults}>
                        <Package size={48} />
                        <p>No hay pedidos que coincidan con tu búsqueda</p>
                    </div>
                )}
            </div>

            {/* MODAL DE DETALLES */}
            {selectedOrder && (
                <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h2>Pedido {selectedOrder.idPedido}</h2>
                                <span className={styles.dateInfo}>{selectedOrder.fecha}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <a
                                    href={`/comprobante/${selectedOrder.idPedido}`}
                                    target="_blank"
                                    className={styles.printBtn}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '5px',
                                        padding: '5px 10px', borderRadius: '5px',
                                        backgroundColor: '#f3f4f6', textDecoration: 'none', color: '#333',
                                        fontSize: '0.9rem', fontWeight: 600
                                    }}
                                >
                                    <Printer size={18} /> Imprimir Remito
                                </a>
                                <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.modalContent}>
                            <div className={styles.detailSection}>
                                <h3>Datos del Cliente</h3>
                                <p><strong>Email:</strong> {selectedOrder.email}</p>
                            </div>

                            <div className={styles.detailSection}>
                                <h3>Productos</h3>
                                <div className={styles.productList}>
                                    {selectedOrder.productos.split(';').map((prod, i) => (
                                        <div key={i} className={styles.productItem}>
                                            <span>{prod}</span>
                                        </div>
                                    ))}
                                    <div className={styles.productItem} style={{ marginTop: '10px', fontWeight: 'bold' }}>
                                        <span>Total:</span>
                                        <span>${selectedOrder.total.toLocaleString('es-AR')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.detailSection}>
                                <h3>Gestión de Estado</h3>
                                <div className={styles.statusControl}>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className={styles.statusSelect}
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Preparado">Preparado</option>
                                        <option value="Entregado">Entregado</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                    <button
                                        onClick={handleUpdateStatus}
                                        className={styles.updateBtn}
                                        disabled={updating || newStatus === selectedOrder.estado}
                                    >
                                        {updating ? 'Guardando...' : 'Actualizar Estado'}
                                    </button>
                                </div>
                                {updateMessage && <p className={styles.message}>{updateMessage}</p>}

                                {newStatus === 'Cancelado' && selectedOrder.estado !== 'Cancelado' && (
                                    <div className={styles.warningBox}>
                                        <AlertTriangle size={20} />
                                        <p>Atención: Al cancelar el pedido, el stock de los productos se restituirá automáticamente.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
