'use client';

import { useState, useEffect, useRef } from 'react';
import { Package, Search, Filter, X, Save, AlertTriangle, Printer, Eye, Users, Check, ShieldAlert, ShoppingCart, Plus, Trash2, FileText, UserPlus, CreditCard, RotateCcw, Megaphone, MessageSquare, Download, Mail, Send } from 'lucide-react';
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

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    originalPrice?: number;
    cost: number;
}

interface PosItem {
    id: string;
    name: string;
    price: number;
    originalPrice: number; // Para referencia
    quantity: number;
    stock: number;
    cost: number;
}

interface PosClient {
    name: string;
    email: string; // Puede ser vacío si es consumidor final
    cuit: string;
    type: 'Mayorista' | 'Consumidor Final';
}

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState<'pedidos' | 'usuarios' | 'facturador' | 'campañas' | 'rma' | 'banners'>('pedidos');

    // Estados para Banners
    interface BannerAdmin {
        id: string;
        imagenUrl: string;
        titulo: string;
        descripcion: string;
        link: string;
        textoBoton: string;
        activo: boolean;
    }
    const [adminBanners, setAdminBanners] = useState<BannerAdmin[]>([]);
    const [loadingBanners, setLoadingBanners] = useState(false);
    const [newBanner, setNewBanner] = useState({ imagenUrl: '', titulo: '', descripcion: '', link: '', textoBoton: 'Ver Más', activo: true });
    const [isSavingBanner, setIsSavingBanner] = useState(false);

    // Estados para RMA Admin
    interface RmaAdmin {
        idRma: string;
        email: string;
        producto: string;
        nroSerie: string;
        falla: string;
        fechaCompra: string;
        observaciones: string;
        estado: string;
        fecha: string;
    }
    const [rmas, setRmas] = useState<RmaAdmin[]>([]);
    const [loadingRma, setLoadingRma] = useState(false);
    const [selectedRma, setSelectedRma] = useState<RmaAdmin | null>(null);
    const [newRmaStatus, setNewRmaStatus] = useState('');
    const [updatingRma, setUpdatingRma] = useState(false);
    const [rmaUpdateMessage, setRmaUpdateMessage] = useState('');
    const [rmaSearchTerm, setRmaSearchTerm] = useState('');
    const [rmaFilterEstado, setRmaFilterEstado] = useState('Todos');

    // Estados para Campañas
    const [campaignSubject, setCampaignSubject] = useState('');
    const [campaignMessage, setCampaignMessage] = useState('');
    const [campaignTarget, setCampaignTarget] = useState<'todos' | 'habilitados' | 'pendientes'>('habilitados');
    const [campaignSending, setCampaignSending] = useState(false);
    const [campaignResult, setCampaignResult] = useState<{ success: number; failed: number } | null>(null);
    const [whatsappTemplate, setWhatsappTemplate] = useState<'bienvenida' | 'reactivacion' | 'oferta'>('reactivacion');
    const [whatsappSelectedUser, setWhatsappSelectedUser] = useState<UserAdmin | null>(null);

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

    // Estados para Facturador (POS)
    const [activePosTab, setActivePosTab] = useState<'remito' | 'presupuesto' | 'nota_credito'>('remito');
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [posCart, setPosCart] = useState<PosItem[]>([{ id: '', name: '', price: 0, originalPrice: 0, quantity: 1, stock: 0, cost: 0 }]); // Una fila vacía inicial
    const [posClient, setPosClient] = useState<PosClient>({ name: 'Consumidor Final', email: '', cuit: '', type: 'Consumidor Final' });
    const [clientSearch, setClientSearch] = useState('');
    const [showClientSuggestions, setShowClientSuggestions] = useState(false);
    const [posDiscount, setPosDiscount] = useState(0); // Porcentaje de descuento global

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

    const fetchAllProducts = async () => {
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                const normalized = data.map((p: any) => ({
                    id: p.id,
                    name: p.nombre || p.name,
                    price: parseFloat(p.precio || p.price || 0),
                    stock: parseInt(p.stock || 0),
                    category: p.categoria || p.category,
                    originalPrice: parseFloat(p.precioOriginal || p.originalPrice || 0),
                    cost: parseFloat(p.cost || p.costo || 0)
                }));
                setAllProducts(normalized);
            }
        } catch (e) {
            console.error("Error cargando productos POS:", e);
        }
    };

    const fetchBannersAdmin = async () => {
        setLoadingBanners(true);
        try {
            const res = await fetch(`/api/admin/banners?password=${encodeURIComponent(password)}`);
            if (res.ok) {
                const data = await res.json();
                setAdminBanners(data.banners || []);
            }
        } catch (e) {
            console.error('Error fetching banners:', e);
        } finally {
            setLoadingBanners(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            if (activeTab === 'usuarios') fetchUsers();
            if (activeTab === 'pedidos') {
                fetchAllProducts(); // Necesario para mostrar precios en el detalle del modal
            }
            if (activeTab === 'facturador') {
                fetchAllProducts();
                fetchUsers(); // Necesario para el autocompletado de clientes
            }
            if (activeTab === 'campañas') {
                fetchUsers(); // Para WhatsApp y exportador CSV
            }
            if (activeTab === 'rma') {
                fetchRmas();
            }
            if (activeTab === 'banners') {
                fetchBannersAdmin();
            }
        }
    }, [isAuthenticated, activeTab]);

    const fetchRmas = async () => {
        setLoadingRma(true);
        try {
            const res = await fetch(`/api/admin/rma?password=${encodeURIComponent(password)}`);
            if (res.ok) {
                const data = await res.json();
                setRmas(data.rmas || []);
            }
        } catch (e) {
            console.error('Error fetching RMAs:', e);
        } finally {
            setLoadingRma(false);
        }
    };

    const handleUpdateRmaStatus = async () => {
        if (!selectedRma) return;
        setUpdatingRma(true);
        setRmaUpdateMessage('');
        try {
            const res = await fetch('/api/admin/rma', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rmaId: selectedRma.idRma, status: newRmaStatus, password })
            });
            if (res.ok) {
                setRmaUpdateMessage('✅ Estado de RMA actualizado');
                setRmas(rmas.map(r => r.idRma === selectedRma.idRma ? { ...r, estado: newRmaStatus } : r));
                setTimeout(() => setSelectedRma(null), 1500);
            } else {
                const data = await res.json();
                setRmaUpdateMessage(`❌ Error: ${data.error}`);
            }
        } catch (e) {
            setRmaUpdateMessage('❌ Error de conexión');
        } finally {
            setUpdatingRma(false);
        }
    };

    const handleSaveBanner = async () => {
        if (!newBanner.imagenUrl) return alert('Debes agregar al menos la URL de la imagen.');
        
        setIsSavingBanner(true);
        try {
            const res = await fetch('/api/admin/banners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, banner: newBanner })
            });
            if (res.ok) {
                alert('Banner creado correctamente');
                setNewBanner({ imagenUrl: '', titulo: '', descripcion: '', link: '', textoBoton: 'Ver Más', activo: true });
                fetchBannersAdmin();
            } else {
                alert('Error al crear banner');
            }
        } catch (e) {
            console.error(e);
            alert('Error de conexión');
        } finally {
            setIsSavingBanner(false);
        }
    };

    const handleToggleBanner = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch('/api/admin/banners', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, id, updates: { activo: !currentStatus } })
            });
            if (res.ok) {
                fetchBannersAdmin();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteBanner = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este banner?')) return;
        try {
            const res = await fetch('/api/admin/banners', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, id })
            });
            if (res.ok) {
                fetchBannersAdmin();
            }
        } catch (e) {
            console.error(e);
        }
    };

    // --- POS HANDLERS ---
    const handleAddRow = () => {
        setPosCart([...posCart, { id: '', name: '', price: 0, originalPrice: 0, quantity: 1, stock: 0, cost: 0 }]);
    };

    const handleRemoveRow = (index: number) => {
        if (posCart.length === 1) {
            setPosCart([{ id: '', name: '', price: 0, originalPrice: 0, quantity: 1, stock: 0, cost: 0 }]);
            return;
        }
        const newCart = [...posCart];
        newCart.splice(index, 1);
        setPosCart(newCart);
    };

    const handleProductSelect = (index: number, product: Product) => {
        const newCart = [...posCart];
        newCart[index] = {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            quantity: 1,
            stock: product.stock,
            cost: product.cost
        };
        setPosCart(newCart);

        // Auto-add new row if it's the last one
        if (index === posCart.length - 1) {
            handleAddRow();
        }
    };

    const handleUpdateRow = (index: number, field: keyof PosItem, value: any) => {
        const newCart = [...posCart];
        newCart[index] = { ...newCart[index], [field]: value };
        setPosCart(newCart);
    };

    const calculatePosSubtotal = () => {
        return posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculatePosTotal = () => {
        const subtotal = calculatePosSubtotal();
        return subtotal * (1 - (posDiscount / 100));
    };

    const calculatePosMargin = () => {
        // El margen real es el total recaudado menos el costo total de los productos
        const totalNeto = calculatePosTotal();
        const totalCosto = posCart.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
        return totalNeto - totalCosto;
    };

    const handleConfirmSale = async () => {
        if (posCart.length === 0 || !posCart[0].id) {
            alert("El carrito está vacío");
            return;
        }

        const confirm = window.confirm(`¿Confirmar venta por $${calculatePosTotal().toLocaleString('es-AR')}?`);
        if (!confirm) return;

        setLoading(true);
        try {
            // Filtrar filas vacías
            const validItems = posCart.filter(i => i.id);

            const saleData = {
                email: posClient.email || 'mostrador@tienda.com',
                products: validItems.map(i => ({
                    id: i.id,
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price
                })),
                total: calculatePosTotal(),
                isPos: true,
                tipo: activePosTab === 'remito' ? 'Remito' : activePosTab === 'presupuesto' ? 'Presupuesto' : 'Nota de Crédito'
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleData)
            });

            if (res.ok) {
                const data = await res.json();
                alert(`✅ Venta Registrada! Pedido #${data.orderId}`);
                // Reset
                setPosCart([{ id: '', name: '', price: 0, originalPrice: 0, quantity: 1, stock: 0, cost: 0 }]);
                setPosClient({ name: 'Consumidor Final', email: '', cuit: '', type: 'Consumidor Final' });
                setPosDiscount(0);
                // Refetch stock
                fetchAllProducts();
            } else {
                alert("❌ Error al registrar venta");
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

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
    ).reverse(); // Mostrar primero los más nuevos

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
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'facturador' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('facturador')}
                        >
                            <ShoppingCart size={18} /> Facturador
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'campañas' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('campañas')}
                        >
                            <Megaphone size={18} /> Campañas
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'rma' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('rma')}
                        >
                            <ShieldAlert size={18} /> RMA / Garantías
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'banners' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('banners')}
                        >
                            <img src="/ads/rooster_banner.png" alt="Banners" style={{width: 18, height: 18, objectFit: 'contain'}} /> Banners
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
            ) : activeTab === 'usuarios' ? (
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
            ) : activeTab === 'campañas' ? (
                <div className={styles.campaignContainer}>
                    <div className={styles.campaignGrid}>

                        {/* === SECCIÓN 1: EMAIL MASIVO === */}
                        <div className={styles.campaignCard}>
                            <div className={styles.campaignCardHeader}>
                                <Mail size={22} color="#ff5722" />
                                <h2>📧 Envío de Email Masivo</h2>
                            </div>
                            <p className={styles.campaignCardDesc}>Enviá un correo personalizado a tus clientes registrados con el diseño oficial de Yeah! Tecnologías.</p>

                            <div className={styles.campaignField}>
                                <label>👥 Destinatarios</label>
                                <div className={styles.targetSelector}>
                                    {(['habilitados', 'pendientes', 'todos'] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setCampaignTarget(t)}
                                            className={`${styles.targetBtn} ${campaignTarget === t ? styles.targetBtnActive : ''}`}
                                        >
                                            {t === 'habilitados' ? `✅ Habilitados (${users.filter(u => u.habilitado).length})` :
                                             t === 'pendientes' ? `⌛ Pendientes (${users.filter(u => !u.habilitado).length})` :
                                             `👥 Todos (${users.length})`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.campaignField}>
                                <label>📌 Asunto del Email</label>
                                <input
                                    type="text"
                                    placeholder="Ej: ¡Novedades en Yeah! Tecnologías!"
                                    value={campaignSubject}
                                    onChange={e => setCampaignSubject(e.target.value)}
                                    className={styles.campaignInput}
                                />
                            </div>

                            <div className={styles.campaignField}>
                                <label>✍️ Mensaje</label>
                                <textarea
                                    placeholder="Escribí el contenido del mensaje. Podés usar varias líneas."
                                    value={campaignMessage}
                                    onChange={e => setCampaignMessage(e.target.value)}
                                    className={styles.campaignTextarea}
                                    rows={6}
                                />
                            </div>

                            {campaignResult && (
                                <div className={styles.campaignResultBox}>
                                    <p>✅ Enviados: <strong>{campaignResult.success}</strong></p>
                                    <p>❌ Fallidos: <strong>{campaignResult.failed}</strong></p>
                                </div>
                            )}

                            <button
                                className={styles.campaignSendBtn}
                                disabled={campaignSending || !campaignSubject || !campaignMessage}
                                onClick={async () => {
                                    setCampaignSending(true);
                                    setCampaignResult(null);
                                    const targetEmails = users
                                        .filter(u => campaignTarget === 'todos' ? true : campaignTarget === 'habilitados' ? u.habilitado : !u.habilitado)
                                        .map(u => u.email)
                                        .filter(Boolean);
                                    try {
                                        const res = await fetch('/api/admin/campaign', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ emails: targetEmails, subject: campaignSubject, message: campaignMessage, password })
                                        });
                                        const data = await res.json();
                                        setCampaignResult({ success: data.success || 0, failed: data.failed || 0 });
                                    } catch (e) {
                                        setCampaignResult({ success: 0, failed: targetEmails.length });
                                    } finally {
                                        setCampaignSending(false);
                                    }
                                }}
                            >
                                {campaignSending ? (
                                    <><Send size={18} /> Enviando...</>
                                ) : (
                                    <><Send size={18} /> Enviar Campaña</>
                                )}
                            </button>
                        </div>

                        {/* === SECCIÓN 2: ASISTENTE WHATSAPP === */}
                        <div className={styles.campaignCard}>
                            <div className={styles.campaignCardHeader}>
                                <MessageSquare size={22} color="#25d366" />
                                <h2>💬 Asistente de WhatsApp</h2>
                            </div>
                            <p className={styles.campaignCardDesc}>Generá mensajes personalizados listos para enviar por WhatsApp con un solo clic.</p>

                            <div className={styles.campaignField}>
                                <label>📋 Plantilla de Mensaje</label>
                                <div className={styles.templateSelector}>
                                    {([
                                        { id: 'bienvenida', label: '👋 Bienvenida', desc: 'Para clientes nuevos que acaban de registrarse' },
                                        { id: 'reactivacion', label: '🔄 Reactivación', desc: 'Para clientes que hace tiempo no compran' },
                                        { id: 'oferta', label: '🎁 Oferta Especial', desc: 'Para comunicar nuevos productos o descuentos' },
                                    ] as const).map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setWhatsappTemplate(t.id)}
                                            className={`${styles.templateBtn} ${whatsappTemplate === t.id ? styles.templateBtnActive : ''}`}
                                        >
                                            <span>{t.label}</span>
                                            <small>{t.desc}</small>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.campaignField}>
                                <label>🙍 Seleccioná un Cliente</label>
                                <select
                                    className={styles.campaignInput}
                                    value={whatsappSelectedUser?.email || ''}
                                    onChange={e => setWhatsappSelectedUser(users.find(u => u.email === e.target.value) || null)}
                                >
                                    <option value="">-- Elegir cliente --</option>
                                    {users.map(u => (
                                        <option key={u.email} value={u.email}>
                                            {u.nombreCompleto} — {u.nombreLocal || 'Sin local'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {whatsappSelectedUser && (() => {
                                const nombre = whatsappSelectedUser.nombreCompleto.split(' ')[0];
                                const local = whatsappSelectedUser.nombreLocal || 'tu negocio';
                                const templates = {
                                    bienvenida: `¡Hola ${nombre}! 👋 Te damos la bienvenida a *Yeah! Tecnologías*. Ya tenemos tu registro y en breve te habilitamos el acceso completo al catálogo mayorista online. Mientras tanto podés ver los productos en: https://yeahtecnologias.vercel.app/catalogo ¡Cualquier consulta, estamos acá!`,
                                    reactivacion: `¡Hola ${nombre}! 😊 Hace un tiempo que no sabemos nada de *${local}*. Queríamos avisarte que renovamos todo el catálogo con productos nuevos y stock actualizado en tiempo real. Podés verlo directo en la web: https://yeahtecnologias.vercel.app/catalogo ¡Te esperamos!`,
                                    oferta: `¡Hola ${nombre}! 🎁 Buenas noticias para *${local}*: entraron productos nuevos y tenemos ofertas especiales en filamentos, iluminación y accesorios. Entrá al catálogo y descargá la lista de precios actualizada: https://yeahtecnologias.vercel.app/catalogo ¡No te lo perdás!`,
                                };
                                const msg = templates[whatsappTemplate];
                                return (
                                    <>
                                        <div className={styles.whatsappPreview}>
                                            <div className={styles.whatsappPreviewHeader}>Vista previa del mensaje</div>
                                            <p>{msg}</p>
                                        </div>
                                        <a
                                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.whatsappBtn}
                                        >
                                            <MessageSquare size={18} /> Abrir WhatsApp y Enviar
                                        </a>
                                    </>
                                );
                            })()}
                        </div>

                    </div>

                    {/* === SECCIÓN 3: EXPORTADOR CSV === */}
                    <div className={styles.campaignCard} style={{ marginTop: '1.5rem' }}>
                        <div className={styles.campaignCardHeader}>
                            <Download size={22} color="#2563eb" />
                            <h2>📥 Exportar Base de Clientes (CSV)</h2>
                        </div>
                        <p className={styles.campaignCardDesc}>
                            Descargá toda la base de datos de clientes registrados en un archivo Excel/CSV. Podés usarla para cargar los contactos en tu celular o subirla a Meta Ads para hacer publicidad dirigida.
                        </p>
                        <div className={styles.csvPreview}>
                            <table>
                                <thead><tr><th>Nombre</th><th>Local</th><th>Email</th><th>CUIT/CUIL</th><th>Registrado</th><th>Estado</th></tr></thead>
                                <tbody>
                                    {users.slice(0, 3).map(u => (
                                        <tr key={u.email}>
                                            <td>{u.nombreCompleto}</td>
                                            <td>{u.nombreLocal || '-'}</td>
                                            <td>{u.email}</td>
                                            <td>{u.cuitCuil || '-'}</td>
                                            <td>{u.fechaRegistro || '-'}</td>
                                            <td>{u.habilitado ? '✅ Habilitado' : '⌛ Pendiente'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length > 3 && <p className={styles.csvMore}>...y {users.length - 3} cliente{users.length - 3 !== 1 ? 's' : ''} más</p>}
                        </div>
                        <button
                            className={styles.csvDownloadBtn}
                            onClick={() => {
                                const headers = ['Nombre Completo', 'Nombre Local', 'Email', 'CUIT/CUIL', 'Fecha Registro', 'Estado'];
                                const rows = users.map(u => [
                                    u.nombreCompleto,
                                    u.nombreLocal || '',
                                    u.email,
                                    u.cuitCuil || '',
                                    u.fechaRegistro || '',
                                    u.habilitado ? 'Habilitado' : 'Pendiente'
                                ]);
                                const csvContent = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
                                const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `clientes-yeah-${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.csv`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                        >
                            <Download size={18} /> Descargar {users.length} Clientes en CSV
                        </button>
                    </div>
                </div>
            ) : activeTab === 'banners' ? (
                <div className={styles.campaignContainer}>
                    <div className={styles.campaignGrid}>
                        {/* SECCIÓN 1: Crear nuevo Banner */}
                        <div className={styles.campaignCard}>
                            <div className={styles.campaignCardHeader}>
                                <h2>🖼️ Agregar Nuevo Banner</h2>
                            </div>
                            <p className={styles.campaignCardDesc}>
                                Podés subir la imagen a un servicio gratuito como Imgur o colocarla en la carpeta <code>public/banners/</code> y usar <code>/banners/mi-imagen.png</code>.
                            </p>
                            
                            <div className={styles.campaignField}>
                                <label>URL de la Imagen (Obligatorio)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: https://i.imgur.com/tu-imagen.jpg o /banners/dia-nino.png"
                                    value={newBanner.imagenUrl}
                                    onChange={e => setNewBanner({ ...newBanner, imagenUrl: e.target.value })}
                                    className={styles.campaignInput}
                                />
                            </div>
                            <div className={styles.campaignField}>
                                <label>Link de destino (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: /catalogo?tag=niño"
                                    value={newBanner.link}
                                    onChange={e => setNewBanner({ ...newBanner, link: e.target.value })}
                                    className={styles.campaignInput}
                                />
                            </div>
                            <div className={styles.campaignField}>
                                <label>Título (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Título del banner"
                                    value={newBanner.titulo}
                                    onChange={e => setNewBanner({ ...newBanner, titulo: e.target.value })}
                                    className={styles.campaignInput}
                                />
                            </div>
                            <div className={styles.campaignField}>
                                <label>Descripción (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Descripción corta"
                                    value={newBanner.descripcion}
                                    onChange={e => setNewBanner({ ...newBanner, descripcion: e.target.value })}
                                    className={styles.campaignInput}
                                />
                            </div>
                            
                            <button
                                className={styles.campaignSendBtn}
                                onClick={handleSaveBanner}
                                disabled={isSavingBanner || !newBanner.imagenUrl}
                                style={{ marginTop: '1rem' }}
                            >
                                {isSavingBanner ? 'Guardando...' : 'Crear Banner'}
                            </button>
                        </div>
                        
                        {/* SECCIÓN 2: Lista de Banners */}
                        <div className={styles.campaignCard}>
                            <div className={styles.campaignCardHeader}>
                                <h2>📊 Banners Actuales</h2>
                            </div>
                            
                            {loadingBanners ? <p>Cargando banners...</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                    {adminBanners.length === 0 && <p>No hay banners creados.</p>}
                                    {adminBanners.map(b => (
                                        <div key={b.id} style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', gap: '15px', alignItems: 'center' }}>
                                            <img src={b.imagenUrl} alt="Banner" style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold' }}>{b.titulo || 'Sin título'}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Link: {b.link || 'Ninguno'}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button 
                                                    onClick={() => handleToggleBanner(b.id, b.activo)}
                                                    className={b.activo ? styles.btnHabilitado : styles.btnDeshabilitado}
                                                >
                                                    {b.activo ? 'Activo' : 'Oculto'}
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteBanner(b.id)}
                                                    style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : activeTab === 'rma' ? (
                <div className={styles.rmaAdminContainer}>
                    <div className={styles.controls}>
                        <div className={styles.searchBar}>
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Buscar RMA por ID, producto o cliente..."
                                value={rmaSearchTerm}
                                onChange={e => setRmaSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className={styles.filters}>
                            {['Todos', 'Pendiente', 'En Revisión', 'Cambiado', 'Devuelto'].map(e => (
                                <button
                                    key={e}
                                    onClick={() => setRmaFilterEstado(e)}
                                    className={rmaFilterEstado === e ? styles.activeFilter : ''}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.ordersTable}>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID RMA</th>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Producto</th>
                                    <th>Nro Serie</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rmas
                                    .filter(r =>
                                        (r.idRma.toLowerCase().includes(rmaSearchTerm.toLowerCase()) ||
                                         r.producto.toLowerCase().includes(rmaSearchTerm.toLowerCase()) ||
                                         r.email.toLowerCase().includes(rmaSearchTerm.toLowerCase())) &&
                                        (rmaFilterEstado === 'Todos' || r.estado === rmaFilterEstado)
                                    )
                                    .map(rma => (
                                        <tr key={rma.idRma} onClick={() => {
                                            setSelectedRma(rma);
                                            setNewRmaStatus(rma.estado);
                                            setRmaUpdateMessage('');
                                        }}>
                                            <td><strong style={{fontFamily:'monospace'}}>{rma.idRma}</strong></td>
                                            <td>{rma.fecha}</td>
                                            <td>{rma.email}</td>
                                            <td><strong>{rma.producto}</strong></td>
                                            <td style={{color:'#64748b'}}>{rma.nroSerie}</td>
                                            <td>
                                                <span className={`${styles.badge} ${
                                                    rma.estado === 'En Revisión' ? styles.preparado :
                                                    rma.estado === 'Cambiado' ? styles.entregado :
                                                    rma.estado === 'Devuelto' ? styles.cancelado :
                                                    styles.pendiente
                                                }`}>
                                                    {rma.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                }
                                {rmas.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{textAlign:'center', padding:'3rem', color:'#94a3b8'}}>
                                            No hay solicitudes de RMA registradas
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className={styles.posContainer}>
                    {/* CABECERA EXCLUSIVA IMPRESIÓN */}
                    <div className={styles.printOnlyHeader}>
                        <div className={styles.printHeaderTop}>
                            <img src="/logo.jpg" alt="Yeah! Tecnologías" className={styles.printLogo} />
                            <div className={styles.printCompanyInfo}>
                                <h2>YEAH! TECNOLOGÍAS</h2>
                                <p>Santa Fe, Argentina</p>
                                <p>WhatsApp: +54 9 342 592 4747</p>
                                <p>yeah-tecnologias.vercel.app</p>
                            </div>
                            <div className={styles.printDocInfo}>
                                <div className={styles.docTypeBadge}>
                                    {activePosTab === 'remito' ? 'REMITO X' : activePosTab === 'presupuesto' ? 'PRESUPUESTO' : 'NOTA DE CRÉDITO'}
                                </div>
                                <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-AR')}</p>
                            </div>
                        </div>
                        <div className={styles.printClientInfo}>
                            <h3>Datos del Cliente:</h3>
                            <p><strong>Razón Social:</strong> {posClient.name}</p>
                            {posClient.email && <p><strong>Email:</strong> {posClient.email}</p>}
                            {posClient.cuit && <p><strong>CUIT/CUIL:</strong> {posClient.cuit}</p>}
                        </div>
                    </div>

                    {/* ENCABEZADO FACTURADOR (Modo Edición) */}
                    <div className={styles.posHeader}>
                        <div className={styles.clientSection}>
                            <label>Cliente / Razón Social</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar cliente (o Consumidor Final)"
                                    value={posClient.name}
                                    onChange={(e) => {
                                        setPosClient({ ...posClient, name: e.target.value });
                                        setClientSearch(e.target.value);
                                        setShowClientSuggestions(true);
                                    }}
                                    onFocus={() => setShowClientSuggestions(true)}
                                    className={styles.posInput}
                                />
                                {showClientSuggestions && (clientSearch.length > 1 || clientSearch === '') && (
                                    <>
                                        <div className={styles.suggestionsOverlay} onClick={() => setShowClientSuggestions(false)} />
                                        <div className={styles.suggestions}>
                                            {users
                                                .filter(u =>
                                                    u.nombreCompleto.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                                    u.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                                    u.nombreLocal.toLowerCase().includes(clientSearch.toLowerCase())
                                                )
                                                .slice(0, 10)
                                                .map(u => (
                                                    <div
                                                        key={u.email}
                                                        className={styles.suggestionItem}
                                                        onClick={() => {
                                                            setPosClient({
                                                                name: u.nombreCompleto,
                                                                email: u.email,
                                                                cuit: u.cuitCuil,
                                                                type: 'Mayorista'
                                                            });
                                                            setClientSearch(u.nombreCompleto);
                                                            setShowClientSuggestions(false);
                                                        }}
                                                    >
                                                        <strong>{u.nombreCompleto}</strong>
                                                        {u.nombreLocal && <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#666' }}>({u.nombreLocal})</span>}
                                                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{u.email}</div>
                                                    </div>
                                                ))
                                            }
                                            <div
                                                className={styles.suggestionItem}
                                                onClick={() => {
                                                    setPosClient({ name: 'Consumidor Final', email: '', cuit: '', type: 'Consumidor Final' });
                                                    setClientSearch('Consumidor Final');
                                                    setShowClientSuggestions(false);
                                                }}
                                            >
                                                <em>Consumidor Final</em>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className={styles.docTypeSection}>
                            <label>Tipo Comprobante</label>
                            <select
                                value={activePosTab}
                                onChange={(e) => setActivePosTab(e.target.value as any)}
                                className={styles.posInpuSelect}
                            >
                                <option value="remito">Remito X</option>
                                <option value="presupuesto">Presupuesto</option>
                                <option value="nota_credito">Nota de Crédito</option>
                            </select>
                        </div>
                        <div className={styles.dateSection}>
                            <label>Fecha</label>
                            <div className={styles.staticValue}>{new Date().toLocaleDateString('es-AR')}</div>
                        </div>
                        <div className={styles.discountSection} style={{ borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                            <label>Descuento Global (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={posDiscount}
                                onChange={(e) => setPosDiscount(parseFloat(e.target.value) || 0)}
                                className={styles.posInput}
                            />
                        </div>
                    </div>

                    {/* TABLA DE PRODUCTOS */}
                    <div className={styles.posTableContainer}>
                        <table className={styles.posTable}>
                            <thead>
                                <tr>
                                    <th style={{ width: '80px' }}>Cant</th>
                                    <th>Producto (Buscador)</th>
                                    <th style={{ width: '120px' }}>Precio Unit.</th>
                                    <th className={styles.adminOnlyHeader} style={{ width: '100px' }}>Costo</th>
                                    <th className={styles.adminOnlyHeader} title="Margen Bruto (sin descuento)" style={{ width: '100px' }}>Margen B.</th>
                                    <th style={{ width: '120px' }}>Subtotal</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {posCart.map((row, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                value={row.quantity}
                                                onChange={(e) => handleUpdateRow(index, 'quantity', parseInt(e.target.value) || 1)}
                                                className={styles.posQtyInput}
                                            />
                                        </td>
                                        <td style={{ position: 'relative' }}>
                                            {/* Texto para impresión */}
                                            <span className={styles.printProductText}>{row.name}</span>

                                            <input
                                                type="text"
                                                placeholder="Escriba para buscar..."
                                                value={row.name}
                                                onChange={(e) => handleUpdateRow(index, 'name', e.target.value)}
                                                className={styles.posProductInput}
                                                autoComplete="off"
                                            />

                                            {row.name && !row.id && (
                                                <div className={styles.productSuggestions}>
                                                    {allProducts
                                                        .filter(p => p.name.toLowerCase().includes(row.name.toLowerCase()))
                                                        .slice(0, 10)
                                                        .map(p => (
                                                            <div
                                                                key={p.id}
                                                                className={styles.suggestionItem}
                                                                onClick={() => handleProductSelect(index, p)}
                                                            >
                                                                <div style={{ fontWeight: 600 }}>{p.name}</div>
                                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                                    Precio: ${p.price} | Stock: {p.stock}
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.priceInputGroup}>
                                                <span>$</span>
                                                <input
                                                    type="number"
                                                    value={row.price}
                                                    onChange={(e) => handleUpdateRow(index, 'price', parseFloat(e.target.value) || 0)}
                                                    className={styles.posPriceInput}
                                                />
                                            </div>
                                        </td>
                                        <td className={styles.adminOnlyCell}>
                                            <span style={{ fontSize: '0.9rem', color: '#666' }}>${row.cost}</span>
                                        </td>
                                        <td className={styles.adminOnlyCell}>
                                            <span style={{
                                                fontWeight: 600,
                                                color: (row.price - row.cost) >= 0 ? '#16a34a' : '#dc2626'
                                            }}>
                                                ${((row.price - row.cost) * row.quantity).toLocaleString('es-AR')}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>${(row.price * row.quantity).toLocaleString('es-AR')}</strong>
                                        </td>
                                        <td>
                                            <button onClick={() => handleRemoveRow(index)} className={styles.trashBtn} title="Eliminar fila">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={handleAddRow} className={styles.addRowBtn}>
                            <Plus size={16} /> Agregar Fila
                        </button>
                    </div>

                    {/* TOTALES Y ACCIONES */}
                    <div className={styles.posFooter}>
                        <div style={{ display: 'flex', gap: '3rem' }}>
                            <div className={styles.posTotal}>
                                {posDiscount > 0 && (
                                    <div style={{ fontSize: '1rem', color: '#666', marginBottom: '0.25rem' }}>
                                        Subtotal: ${calculatePosSubtotal().toLocaleString('es-AR')}
                                    </div>
                                )}
                                <span>Total Final:</span>
                                <h1>${calculatePosTotal().toLocaleString('es-AR')}</h1>
                                {posDiscount > 0 && <small style={{ color: '#ff5722', fontWeight: 700 }}>{posDiscount}% OFF Aplicado</small>}
                            </div>
                            <div className={styles.adminOnlyFooter} style={{ borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                                <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Ganancia Real:</span>
                                <h2 style={{
                                    fontSize: '2rem',
                                    color: calculatePosMargin() >= 0 ? '#16a34a' : '#dc2626',
                                    marginTop: '0.5rem'
                                }}>
                                    ${calculatePosMargin().toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </h2>
                            </div>
                        </div>
                        <div className={styles.posActions}>
                            <button className={styles.printBtn} onClick={() => window.print()}>
                                <Printer size={20} /> Imprimir
                            </button>
                            <button className={styles.confirmBtn} onClick={handleConfirmSale} disabled={loading}>
                                {loading ? 'Procesando...' : '✅ Confirmar Venta'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DETALLE PEDIDO */}
            {selectedOrder && (
                <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h2>Pedido {selectedOrder.idPedido}</h2>
                                <p className={styles.dateInfo}>Fecha: {selectedOrder.fecha}</p>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.detailSection}>
                                <h3>Información del Cliente</h3>
                                <p><strong>Email/Usuario:</strong> {selectedOrder.email}</p>
                            </div>

                            <div className={styles.detailSection}>
                                <h3>Detalle de Productos</h3>
                                <div className={styles.productListDetailed}>
                                    <table className={styles.detailTable}>
                                        <thead>
                                            <tr>
                                                <th>Cant.</th>
                                                <th>Producto</th>
                                                <th>Unit.</th>
                                                <th>Costo</th>
                                                <th>Ganancia</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                let totalGananciaPedido = 0;
                                                const rows = selectedOrder.productos.split(';').map((itemStr, i) => {
                                                    const match = itemStr.match(/(.+)\s\(x(\d+)\)/);
                                                    if (match) {
                                                        const nombre = match[1].trim();
                                                        const cantidad = parseInt(match[2]);
                                                        const prod = allProducts.find(p => p.name === nombre) || allProducts.find(p => p.name.includes(nombre));
                                                        const unitPrice = prod ? prod.price : 0;
                                                        const unitCost = prod ? (prod.cost || 0) : 0;
                                                        const gananciaItem = (unitPrice - unitCost) * cantidad;
                                                        totalGananciaPedido += gananciaItem;

                                                        return (
                                                            <tr key={i}>
                                                                <td style={{ textAlign: 'center' }}>{cantidad}</td>
                                                                <td>{nombre}</td>
                                                                <td>${unitPrice.toLocaleString('es-AR')}</td>
                                                                <td style={{ color: '#666' }}>${unitCost.toLocaleString('es-AR')}</td>
                                                                <td style={{ 
                                                                    fontWeight: 600, 
                                                                    color: gananciaItem >= 0 ? '#16a34a' : '#dc2626' 
                                                                }}>
                                                                    ${gananciaItem.toLocaleString('es-AR')}
                                                                </td>
                                                                <td style={{ fontWeight: 600 }}>${(unitPrice * cantidad).toLocaleString('es-AR')}</td>
                                                            </tr>
                                                        );
                                                    }
                                                    return (
                                                        <tr key={i}>
                                                            <td style={{ textAlign: 'center' }}>1</td>
                                                            <td>{itemStr}</td>
                                                            <td colSpan={4} style={{ textAlign: 'center', color: '#999' }}>Detalle no disponible para cálculo</td>
                                                        </tr>
                                                    );
                                                });

                                                return (
                                                    <>
                                                        {rows}
                                                        <tr>
                                                            <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold', paddingTop: '1.5rem' }}>GANANCIA TOTAL:</td>
                                                            <td colSpan={2} style={{ 
                                                                paddingTop: '1.5rem',
                                                                fontSize: '1.2rem',
                                                                fontWeight: 'bold',
                                                                color: totalGananciaPedido >= 0 ? '#16a34a' : '#dc2626'
                                                            }}>
                                                                ${totalGananciaPedido.toLocaleString('es-AR')}
                                                            </td>
                                                        </tr>
                                                    </>
                                                );
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ textAlign: 'right', marginTop: '1rem', borderTop: '2px solid var(--border)', paddingTop: '1rem' }}>
                                    <h2 style={{ color: 'var(--primary)' }}>A pagar: ${selectedOrder.total.toLocaleString('es-AR')}</h2>
                                </div>
                            </div>

                            <div className={styles.statusControl}>
                                <h3>Gestión de Pedido</h3>
                                <div className={styles.statusSelect}>
                                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Preparado">Preparado</option>
                                        <option value="Entregado">Entregado</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                    <button onClick={handleUpdateStatus} className={styles.updateBtn} disabled={updating}>
                                        {updating ? 'Guardando...' : 'Actualizar Estado'}
                                    </button>
                                </div>
                                {updateMessage && (
                                    <p style={{ marginTop: '0.5rem', fontWeight: 600, color: updateMessage.includes('✅') ? 'green' : 'red' }}>
                                        {updateMessage}
                                    </p>
                                )}
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                <a
                                    href={`/comprobante/${selectedOrder.idPedido}`}
                                    target="_blank"
                                    className={styles.viewBtn}
                                    style={{
                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        backgroundColor: '#f8fafc', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                        textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600
                                    }}
                                >
                                    <FileText size={18} /> Ver Comprobante
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* MODAL DETALLE DE RMA PARA ADMIN */}
            {selectedRma && (
                <div className={styles.modalOverlay} onClick={() => setSelectedRma(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h2>Detalle de RMA {selectedRma.idRma}</h2>
                                <p className={styles.modalDate}>Fecha Solicitud: {selectedRma.fecha}</p>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setSelectedRma(null)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.detailSection}>
                                <h3>Información General</h3>
                                <div className={styles.detailGrid} style={{gridTemplateColumns:'1fr'}}>
                                    <p><strong>Cliente:</strong> {selectedRma.email}</p>
                                    <p><strong>Producto:</strong> {selectedRma.producto}</p>
                                    <p><strong>Nro. de Serie:</strong> {selectedRma.nroSerie}</p>
                                    <p><strong>Fecha de Compra declarada:</strong> {selectedRma.fechaCompra}</p>
                                </div>
                            </div>

                            <div className={styles.detailSection}>
                                <h3>Descripción de la Falla</h3>
                                <div style={{padding:'1rem', background:'#f8fafc', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', whiteSpace:'pre-wrap', lineHeight:1.6}}>
                                    {selectedRma.falla}
                                </div>
                            </div>

                            <div className={styles.detailSection}>
                                <h3>Observaciones adicionales</h3>
                                <div style={{padding:'1rem', background:'#f8fafc', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', whiteSpace:'pre-wrap', lineHeight:1.6}}>
                                    {selectedRma.observaciones}
                                </div>
                            </div>

                            <div className={styles.statusControl} style={{background:'#eff6ff', borderColor:'#bfdbfe'}}>
                                <h3 style={{color:'#1e3a8a'}}>Actualizar Estado RMA</h3>
                                <div className={styles.statusSelect}>
                                    <select value={newRmaStatus} onChange={e => setNewRmaStatus(e.target.value)} style={{borderColor:'#bfdbfe'}}>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="En Revisión">En Revisión</option>
                                        <option value="Cambiado">Cambiado</option>
                                        <option value="Devuelto">Devuelto</option>
                                    </select>
                                    <button onClick={handleUpdateRmaStatus} className={styles.updateBtn} style={{backgroundColor:'#2563eb'}} disabled={updatingRma}>
                                        {updatingRma ? 'Guardando...' : 'Actualizar Estado'}
                                    </button>
                                </div>
                                {rmaUpdateMessage && (
                                    <p style={{ marginTop: '0.5rem', fontWeight: 600, color: rmaUpdateMessage.includes('✅') ? 'green' : 'red' }}>
                                        {rmaUpdateMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
