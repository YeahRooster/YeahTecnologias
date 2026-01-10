'use client';

import { useState, useEffect, useRef } from 'react';
import { Package, Search, Filter, X, Save, AlertTriangle, Printer, Eye, Users, Check, ShieldAlert, ShoppingCart, Plus, Trash2, FileText, UserPlus, CreditCard, RotateCcw } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'pedidos' | 'usuarios' | 'facturador'>('pedidos');

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

    useEffect(() => {
        if (isAuthenticated) {
            if (activeTab === 'usuarios') fetchUsers();
            if (activeTab === 'facturador') {
                fetchAllProducts();
                fetchUsers(); // Necesario para el autocompletado de clientes
            }
        }
    }, [isAuthenticated, activeTab]);

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
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'facturador' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('facturador')}
                        >
                            <ShoppingCart size={18} /> Facturador
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
                                <h3>Productos</h3>
                                <div className={styles.productList}>
                                    {selectedOrder.productos.split(';').map((p, i) => (
                                        <div key={i} className={styles.productItem}>
                                            <span>{p}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                                    <h2 style={{ color: 'var(--primary)' }}>Total: ${selectedOrder.total.toLocaleString('es-AR')}</h2>
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
        </div>
    );
}
