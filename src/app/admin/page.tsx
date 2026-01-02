'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Filter, X, Save, AlertTriangle, Printer, Eye, Users, Check, ShieldAlert } from 'lucide-react';
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

interface UserAdmin {
    email: string;
    nombreCompleto: string;
    nombreLocal: string;
    cuitCuil: string;
    habilitado: boolean;
    fechaRegistro: string;
}

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState<'pedidos' | 'usuarios'>('pedidos');

    // Estados para Pedidos
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('Todos');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');

    // Estados para Usuarios
    const [users, setUsers] = useState<UserAdmin[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');

    const fetchOrders = async (pwd: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/admin?password=${encodeURIComponent(pwd)}`, { cache: 'no-store' });
            if (!response.ok) throw new Error('Contraseña incorrecta');
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

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && activeTab === 'usuarios') {
            fetchUsers();
        }
    }, [isAuthenticated, activeTab]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await fetchOrders(password);
        if (success) {
            setIsAuthenticated(true);
        }
    };

    const handleToggleUser = async (email: string, currentStatus: boolean) => {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, habilitado: !currentStatus })
            });
            if (response.ok) {
                setUsers(users.map(u => u.email === email ? { ...u, habilitado: !currentStatus } : u));
            }
        } catch (error) {
            alert('Error al actualizar usuario');
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;
        setUpdating(true);
        try {
            const response = await fetch('/api/admin', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: selectedOrder.idPedido, status: newStatus, password })
            });
            if (response.ok) {
                setUpdateMessage('✅ Estado actualizado');
                setOrders(orders.map(o => o.idPedido === selectedOrder.idPedido ? { ...o, estado: newStatus } : o));
                setTimeout(() => setSelectedOrder(null), 1500);
            }
        } catch (error) {
            setUpdateMessage('❌ Error de conexión');
        } finally {
            setUpdating(false);
        }
    };

    // Filtrados
    const filteredOrders = orders.filter(o =>
        (o.idPedido.toLowerCase().includes(searchTerm.toLowerCase()) || o.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterEstado === 'Todos' || o.estado === filterEstado)
    );

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.nombreCompleto.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.nombreLocal.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    if (!isAuthenticated) {
        return (
            <div className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <h1>🔐 Panel Admin</h1>
                    <p>Acceso restringido</p>
                    {error && <div className={styles.error}>{error}</div>}
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="submit" disabled={loading}>{loading ? 'Verificando...' : 'Ingresar'}</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h1>📊 Panel Admin</h1>
                    <nav className={styles.adminTabs}>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'pedidos' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('pedidos')}
                        >
                            <Package size={18} /> Pedidos
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'usuarios' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('usuarios')}
                        >
                            <Users size={18} /> Usuarios
                        </button>
                    </nav>
                </div>
                <button onClick={() => setIsAuthenticated(false)} className={styles.logoutBtn}>Cerrar Sesión</button>
            </div>

            {activeTab === 'pedidos' ? (
                <>
                    {/* Búsqueda y Filtros Pedidos */}
                    <div className={styles.controls}>
                        <div className={styles.searchBar}>
                            <Search size={20} />
                            <input type="text" placeholder="Buscar pedidos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className={styles.filters}>
                            {['Todos', 'Pendiente', 'Preparado', 'Entregado', 'Cancelado'].map(e => (
                                <button key={e} onClick={() => setFilterEstado(e)} className={filterEstado === e ? styles.activeFilter : ''}>{e}</button>
                            ))}
                        </div>
                    </div>

                    {/* Tabla de Pedidos */}
                    <div className={styles.ordersTable}>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(o => (
                                    <tr key={o.idPedido} onClick={() => { setSelectedOrder(o); setNewStatus(o.estado); }}>
                                        <td><strong>{o.idPedido}</strong></td>
                                        <td>{o.fecha}</td>
                                        <td>{o.email}</td>
                                        <td><strong>${o.total.toLocaleString('es-AR')}</strong></td>
                                        <td><span className={`${styles.badge} ${styles[o.estado.toLowerCase()]}`}>{o.estado}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <>
                    {/* Búsqueda Usuarios */}
                    <div className={styles.controls}>
                        <div className={styles.searchBar}>
                            <Search size={20} />
                            <input type="text" placeholder="Buscar por email, nombre o local..." value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    {/* Tabla de Usuarios */}
                    <div className={styles.ordersTable}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Cliente / Local</th>
                                    <th>Email</th>
                                    <th>CUIT/CUIL</th>
                                    <th>Registrado</th>
                                    <th>Acceso Mayorista</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingUsers ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Cargando usuarios...</td></tr>
                                ) : filteredUsers.map(u => (
                                    <tr key={u.email}>
                                        <td>
                                            <div style={{ fontWeight: 'bold' }}>{u.nombreCompleto}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{u.nombreLocal}</div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>{u.cuitCuil}</td>
                                        <td>{u.fechaRegistro}</td>
                                        <td>
                                            <button
                                                onClick={() => handleToggleUser(u.email, u.habilitado)}
                                                className={u.habilitado ? styles.btnHabilitado : styles.btnDeshabilitado}
                                            >
                                                {u.habilitado ? <><Check size={16} /> Habilitado</> : <><ShieldAlert size={16} /> Habilitar</>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* MODAL PEDIDO (Mismo que antes) */}
            {selectedOrder && (
                <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Detalle Pedido {selectedOrder.idPedido}</h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <a href={`/comprobante/${selectedOrder.idPedido}`} target="_blank" className={styles.viewBtn}><Eye size={18} /> Ver Remito</a>
                                <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}><X size={24} /></button>
                            </div>
                        </div>
                        <div className={styles.modalContent}>
                            <p><strong>Cliente:</strong> {selectedOrder.email}</p>
                            <p><strong>Productos:</strong></p>
                            <div className={styles.miniProductList}>
                                {selectedOrder.productos.split(';').map((p, i) => <div key={i}>{p}</div>)}
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <h3>Cambiar Estado</h3>
                                <div className={styles.statusRow}>
                                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className={styles.statusSelect}>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Preparado">Preparado</option>
                                        <option value="Entregado">Entregado</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                    <button onClick={handleUpdateStatus} className={styles.updateBtn} disabled={updating}>{updating ? '...' : 'Actualizar'}</button>
                                </div>
                                {updateMessage && <p>{updateMessage}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
