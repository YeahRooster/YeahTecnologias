'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Edit3, LogOut, Save, X, Printer, RotateCcw, Heart, Download, ShieldAlert, Send, RefreshCw, Briefcase, Share2, Eye, EyeOff, Check, Image as ImageIcon, Settings } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWhiteLabel } from '@/context/WhiteLabelContext';
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
    const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos' | 'rma' | 'whitelabel'>('perfil');

    // Estado para RMA
    interface RmaItem {
        idRma: string;
        producto: string;
        nroSerie: string;
        falla: string;
        fechaCompra: string;
        observaciones: string;
        estado: string;
        fecha: string;
    }
    const [rmas, setRmas] = useState<RmaItem[]>([]);
    const [rmaProductSearch, setRmaProductSearch] = useState('');
    const [rmaProductSelected, setRmaProductSelected] = useState('');
    const [rmaShowSuggestions, setRmaShowSuggestions] = useState(false);
    const [rmaNroSerie, setRmaNroSerie] = useState('');
    const [rmaFalla, setRmaFalla] = useState('');
    const [rmaFechaCompra, setRmaFechaCompra] = useState('');
    const [rmaObservaciones, setRmaObservaciones] = useState('');
    const [rmaSubmitting, setRmaSubmitting] = useState(false);
    const [rmaSuccess, setRmaSuccess] = useState('');
    const [rmaError, setRmaError] = useState('');

    const [user, setUser] = useState<UserData | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<UserData>>({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

    // Cargar RMAs cuando se cambia a la pestaña RMA
    useEffect(() => {
        if (activeTab === 'rma' && user) {
            fetch(`/api/rma?email=${encodeURIComponent(user.email)}`)
                .then(res => res.json())
                .then(data => setRmas(data.rmas || []))
                .catch(err => console.error('Error cargando RMAs:', err));
        }
    }, [activeTab, user]);

    useEffect(() => {
        // Verificar si hay usuario logueado
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(storedUser);
        fetchUserData(userData.email);

        // Verificar si se especificó una pestaña en la URL (?tab=rma o ?tab=pedidos)
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam === 'rma' || tabParam === 'pedidos' || tabParam === 'perfil') {
                setActiveTab(tabParam as any);
            }
        }
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
                setOrders((data.orders || []).reverse());
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

    // Helper para clase de badge de estado RMA
    const getRmaBadgeClass = (estado: string) => {
        switch (estado) {
            case 'En Revisión': return `${styles.rmaBadge} ${styles.rmaBadgeEnRevision}`;
            case 'Cambiado':    return `${styles.rmaBadge} ${styles.rmaBadgeCambiado}`;
            case 'Devuelto':   return `${styles.rmaBadge} ${styles.rmaBadgeDevuelto}`;
            default:            return `${styles.rmaBadge} ${styles.rmaBadgePendiente}`;
        }
    };

    // Enviar nuevo RMA
    const handleRmaSubmit = async () => {
        if (!user || !rmaProductSelected || !rmaFalla) return;
        setRmaSubmitting(true);
        setRmaSuccess('');
        setRmaError('');
        try {
            const res = await fetch('/api/rma', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    producto: rmaProductSelected,
                    nroSerie: rmaNroSerie,
                    falla: rmaFalla,
                    fechaCompra: rmaFechaCompra,
                    observaciones: rmaObservaciones,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setRmaSuccess(`✅ Tu solicitud fue enviada correctamente. ID: ${data.idRma}`);
                setRmaProductSearch('');
                setRmaProductSelected('');
                setRmaNroSerie('');
                setRmaFalla('');
                setRmaFechaCompra('');
                setRmaObservaciones('');
                // Refrescar listado
                const updated = await fetch(`/api/rma?email=${encodeURIComponent(user.email)}`);
                const updatedData = await updated.json();
                setRmas(updatedData.rmas || []);
            } else {
                setRmaError(`❌ Error: ${data.error}`);
            }
        } catch (e) {
            setRmaError('❌ Error de conexión. Intentá nuevamente.');
        } finally {
            setRmaSubmitting(false);
        }
    };

    const {
        isWhiteLabel,
        profitMargin,
        brandName,
        brandLogo,
        whatsappNumber,
        isBarHidden,
        toggleWhiteLabel,
        setProfitMargin,
        setBrandName,
        setBrandLogo,
        setWhatsappNumber,
        toggleBarHidden,
        getShareableLink
    } = useWhiteLabel();

    const [cuentaCopiedLink, setCuentaCopiedLink] = useState(false);

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
                <button
                    className={`${styles.tab} ${activeTab === 'rma' ? styles.active : ''}`}
                    onClick={() => setActiveTab('rma')}
                >
                    <ShieldAlert size={18} /> RMA / Garantías
                </button>
                {user.habilitado && (
                    <button
                        className={`${styles.tab} ${activeTab === 'whitelabel' ? styles.active : ''}`}
                        onClick={() => setActiveTab('whitelabel')}
                    >
                        <Briefcase size={18} /> Mi Local / Revendedor
                    </button>
                )}
            </div>

            {message && <div className={styles.successMessage}>{message}</div>}

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <Package size={24} />
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{orders.length}</span>
                        <span className={styles.statLabel}>Pedidos Realizados</span>
                    </div>
                </div>
                <Link href="/favoritos" className={styles.statCard} style={{ cursor: 'pointer' }}>
                    <Heart size={24} color="var(--accent)" />
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>Ver Mis</span>
                        <span className={styles.statLabel}>Favoritos</span>
                    </div>
                </Link>
                <Link href="/lista-de-precios" className={styles.statCard} style={{ cursor: 'pointer' }}>
                    <Download size={24} color="#2563eb" />
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>Descargar</span>
                        <span className={styles.statLabel}>Lista de Precios</span>
                    </div>
                </Link>
            </div>

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
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                background: 'none', border: 'none', color: '#4f46e5',
                                                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                                                marginRight: '15px'
                                            }}
                                        >
                                            <Package size={16} /> Ver Detalle
                                        </button>
                                        <a href={`/comprobante/${order.idPedido}`} target="_blank" className={styles.printLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
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
            {activeTab === 'rma' && (
                <div className={styles.rmaSection}>

                    {/* FORMULARIO NUEVO RMA */}
                    <div className={styles.rmaFormCard}>
                        <h2><ShieldAlert size={20} /> Solicitar Garantía / RMA</h2>
                        <p>Completá el formulario con los datos del producto con falla. Recibiremos tu solicitud y te informaremos el estado a la brevedad.</p>

                        <div className={styles.rmaForm}>
                            {/* PRODUCTO (buscador) */}
                            <div className={styles.rmaFieldGroup}>
                                <label>🔍 Producto con falla <span style={{color:'#ef4444'}}>*</span></label>
                                <div className={styles.rmaProductSearch}>
                                    <input
                                        type="text"
                                        placeholder="Escribí para buscar el producto..."
                                        value={rmaProductSearch}
                                        onChange={e => {
                                            setRmaProductSearch(e.target.value);
                                            setRmaProductSelected('');
                                            setRmaShowSuggestions(true);
                                        }}
                                        onFocus={() => setRmaShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setRmaShowSuggestions(false), 150)}
                                    />
                                    {rmaShowSuggestions && rmaProductSearch.length > 1 && (
                                        <div className={styles.rmaSuggestions}>
                                            {allProducts
                                                .filter((p: any) => (p.name || p.nombre || '').toLowerCase().includes(rmaProductSearch.toLowerCase()))
                                                .slice(0, 8)
                                                .map((p: any, i: number) => (
                                                    <div
                                                        key={i}
                                                        className={styles.rmaSuggestionItem}
                                                        onMouseDown={() => {
                                                            const name = p.name || p.nombre;
                                                            setRmaProductSelected(name);
                                                            setRmaProductSearch(name);
                                                            setRmaShowSuggestions(false);
                                                        }}
                                                    >
                                                        {p.name || p.nombre}
                                                    </div>
                                                ))
                                            }
                                            {allProducts.filter((p: any) => (p.name || p.nombre || '').toLowerCase().includes(rmaProductSearch.toLowerCase())).length === 0 && (
                                                <div className={styles.rmaSuggestionItem} style={{color:'#94a3b8'}}>Sin resultados</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {rmaProductSelected && (
                                    <small style={{color:'#16a34a', fontWeight: 600}}>✅ Producto seleccionado: {rmaProductSelected}</small>
                                )}
                            </div>

                            {/* GRILLA: Nº Serie + Fecha de compra */}
                            <div className={styles.rmaFormGrid}>
                                <div className={styles.rmaFieldGroup}>
                                    <label>🔢 Nº de Serie <span style={{color:'#94a3b8', fontWeight:400}}>(opcional)</span></label>
                                    <input
                                        type="text"
                                        className={styles.rmaInput}
                                        placeholder="Ej: SN123456789"
                                        value={rmaNroSerie}
                                        onChange={e => setRmaNroSerie(e.target.value)}
                                    />
                                </div>
                                <div className={styles.rmaFieldGroup}>
                                    <label>📅 Fecha de Compra <span style={{color:'#94a3b8', fontWeight:400}}>(opcional)</span></label>
                                    <input
                                        type="date"
                                        className={styles.rmaInput}
                                        value={rmaFechaCompra}
                                        onChange={e => setRmaFechaCompra(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* DESCRIPCIÓN DE LA FALLA */}
                            <div className={styles.rmaFieldGroup}>
                                <label>⚠️ Descripción detallada de la falla <span style={{color:'#ef4444'}}>*</span></label>
                                <textarea
                                    className={styles.rmaTextarea}
                                    rows={4}
                                    placeholder="Describí detalladamente qué le pasa al producto. Cuándo ocurre, cómo se manifiesta, si es intermitente, etc."
                                    value={rmaFalla}
                                    onChange={e => setRmaFalla(e.target.value)}
                                />
                            </div>

                            {/* OBSERVACIONES */}
                            <div className={styles.rmaFieldGroup}>
                                <label>📝 Observaciones adicionales <span style={{color:'#94a3b8', fontWeight:400}}>(opcional)</span></label>
                                <textarea
                                    className={styles.rmaTextarea}
                                    rows={2}
                                    placeholder="Cualquier información adicional que quieras agregar (comprobante, fotos disponibles, etc.)"
                                    value={rmaObservaciones}
                                    onChange={e => setRmaObservaciones(e.target.value)}
                                />
                            </div>

                            {rmaSuccess && <div className={styles.rmaSuccessMsg}>{rmaSuccess}</div>}
                            {rmaError && <div style={{padding:'0.875rem', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'var(--radius-md)', color:'#dc2626', fontSize:'0.9rem'}}>{rmaError}</div>}

                            <button
                                className={styles.rmaSubmitBtn}
                                disabled={rmaSubmitting || !rmaProductSelected || !rmaFalla}
                                onClick={handleRmaSubmit}
                            >
                                {rmaSubmitting ? <><RefreshCw size={18} /> Enviando...</> : <><Send size={18} /> Enviar Solicitud de RMA</>}
                            </button>
                        </div>
                    </div>

                    {/* LISTADO DE MIS RMAs */}
                    <div className={styles.rmaListCard}>
                        <h2><Package size={20} /> Mis solicitudes de RMA</h2>
                        <p>Acá podés ver el estado de todos tus reclamos enviados.</p>

                        {rmas.length === 0 ? (
                            <div className={styles.rmaEmptyState}>
                                <ShieldAlert size={48} />
                                <p>No tenés solicitudes de RMA todavía.</p>
                            </div>
                        ) : (
                            <div style={{overflowX:'auto'}}>
                                <table className={styles.rmaTable}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Producto</th>
                                            <th>Nº Serie</th>
                                            <th>Falla</th>
                                            <th>Fecha</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rmas.map(rma => (
                                            <tr key={rma.idRma}>
                                                <td><strong style={{fontFamily:'monospace', fontSize:'0.8rem'}}>{rma.idRma}</strong></td>
                                                <td><strong>{rma.producto}</strong></td>
                                                <td style={{color:'#64748b'}}>{rma.nroSerie}</td>
                                                <td style={{maxWidth:'220px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={rma.falla}>{rma.falla}</td>
                                                <td style={{whiteSpace:'nowrap', color:'#64748b'}}>{rma.fecha}</td>
                                                <td><span className={getRmaBadgeClass(rma.estado)}>{rma.estado}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* PESTAÑA: MI LOCAL / MODO REVENDEDOR (MARCA BLANCA) */}
            {activeTab === 'whitelabel' && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Briefcase size={24} color="#0284c7" />
                                Configuración de Mi Local / Modo Revendedor
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                Personalizá el catálogo con los datos de tu negocio y tu margen de ganancia para mostrárselo a tus clientes o compartirles el link directo.
                            </p>
                        </div>

                        {/* Switch Activar/Desactivar Modo Mostrador */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isWhiteLabel ? '#16a34a' : '#64748b' }}>
                                {isWhiteLabel ? '✅ Modo Mostrador Activado' : '⚪ Modo Mayorista Normal'}
                            </span>
                            <button
                                onClick={toggleWhiteLabel}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: isWhiteLabel ? '#ef4444' : '#0284c7',
                                    color: 'white'
                                }}
                            >
                                {isWhiteLabel ? 'Desactivar' : 'Activar Modo Mostrador'}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                        {/* Tarjeta 1: Margen y Visibilidad de Barra */}
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1e293b' }}>💰 Margen de Ganancia</h3>
                            
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                Porcentaje de Recargo sobre el Costo Mayorista:
                            </label>
                            
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                {[30, 40, 50, 70].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setProfitMargin(m)}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '6px',
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            border: profitMargin === m ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                            background: profitMargin === m ? '#0284c7' : 'white',
                                            color: profitMargin === m ? 'white' : '#334155',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        +{m}%
                                    </button>
                                ))}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input
                                        type="number"
                                        min="0"
                                        max="500"
                                        value={profitMargin}
                                        onChange={e => setProfitMargin(Math.max(0, parseInt(e.target.value) || 0))}
                                        style={{ width: '70px', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}
                                    />
                                    <span style={{ fontWeight: 700 }}>%</span>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                                    <input
                                        type="checkbox"
                                        checked={!isBarHidden}
                                        onChange={toggleBarHidden}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    Mostrar barra superior de control de margen en la web
                                </label>
                                <small style={{ display: 'block', color: '#64748b', fontSize: '0.78rem', marginTop: '4px', marginLeft: '26px' }}>
                                    Si desmarcás esto, la barra superior se ocultará en toda la web para que navegues frente a tu cliente sin que vea el margen.
                                </small>
                            </div>
                        </div>

                        {/* Tarjeta 2: Datos de Tu Local */}
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1e293b' }}>🏬 Datos de Tu Local</h3>
                            
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                                    Nombre de Tu Negocio:
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: TechStore Rosario"
                                    value={brandName}
                                    onChange={e => setBrandName(e.target.value)}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                                    WhatsApp para recibir pedidos de tus clientes:
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: 5493421234567"
                                    value={whatsappNumber}
                                    onChange={e => setWhatsappNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                                    Logo de Tu Negocio:
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="cuenta-logo-upload"
                                        style={{ display: 'none' }}
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setBrandLogo(reader.result as string);
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="cuenta-logo-upload"
                                        style={{
                                            padding: '0.5rem 0.8rem',
                                            background: '#0284c7',
                                            color: 'white',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem'
                                        }}
                                    >
                                        <ImageIcon size={16} /> Subir Logo
                                    </label>
                                    {brandLogo && (
                                        <button
                                            type="button"
                                            onClick={() => setBrandLogo('')}
                                            style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '0.5rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem' }}
                                        >
                                            Quitar Logo
                                        </button>
                                    )}
                                </div>
                                {brandLogo && (
                                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#0f172a', borderRadius: '6px', textAlign: 'center' }}>
                                        <img src={brandLogo} alt="Logo" style={{ maxHeight: '40px', maxWidth: '100%', objectFit: 'contain' }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta 3: Compartir Catálogo con Clientes */}
                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Share2 size={20} color="#2563eb" />
                                    Link de Tu Catálogo para Clientes
                                </h3>
                                <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                                    Enviá este enlace por WhatsApp a tus clientes. Ellos verán tus precios con el +{profitMargin}% de ganancia, tu logo y podrán pedirte directamente por WhatsApp.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    const link = getShareableLink();
                                    navigator.clipboard.writeText(link).then(() => {
                                        setCuentaCopiedLink(true);
                                        setTimeout(() => setCuentaCopiedLink(false), 2500);
                                    });
                                }}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: '#16a34a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)'
                                }}
                            >
                                {cuentaCopiedLink ? <Check size={18} /> : <Share2 size={18} />}
                                {cuentaCopiedLink ? '¡Link Copiado al Portapapeles!' : 'Copiar Link para Clientes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DETALLE PEDIDO PARA CLIENTE */}
            {selectedOrder && (
                <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h2>Pedido {selectedOrder.idPedido}</h2>
                                <p className={styles.modalDate}>Fecha: {selectedOrder.fecha}</p>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.detailSection}>
                                <h3>Resumen de Productos</h3>
                                <div className={styles.productListDetailed}>
                                    <table className={styles.detailTable}>
                                        <thead>
                                            <tr>
                                                <th>Cant.</th>
                                                <th>Descripción</th>
                                                <th>Unit.</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.productos.split(';').map((itemStr, i) => {
                                                const match = itemStr.match(/(.+)\s\(x(\d+)\)/);
                                                if (match) {
                                                    const nombre = match[1].trim();
                                                    const cantidad = parseInt(match[2]);
                                                    const prod = allProducts.find(p => (p.nombre || p.name) === nombre || (p.nombre || p.name).includes(nombre));
                                                    const unitPrice = prod ? parseFloat(prod.precio || prod.price) : 0;
                                                    return (
                                                        <tr key={i}>
                                                            <td style={{ textAlign: 'center' }}>{cantidad}</td>
                                                            <td>{nombre}</td>
                                                            <td>${unitPrice.toLocaleString('es-AR')}</td>
                                                            <td style={{ fontWeight: 600 }}>${(unitPrice * cantidad).toLocaleString('es-AR')}</td>
                                                        </tr>
                                                    );
                                                }
                                                return (
                                                    <tr key={i}>
                                                        <td style={{ textAlign: 'center' }}>1</td>
                                                        <td>{itemStr}</td>
                                                        <td>-</td>
                                                        <td>-</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className={styles.detailTotal}>
                                    <span>Total del Pedido:</span>
                                    <strong>${selectedOrder.total.toLocaleString('es-AR')}</strong>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button className={styles.reorderBtnModal} onClick={() => { handleReorder(selectedOrder); setSelectedOrder(null); }}>
                                    <RotateCcw size={18} /> Repetir este Pedido
                                </button>
                                <a href={`/comprobante/${selectedOrder.idPedido}`} target="_blank" className={styles.printBtnModal}>
                                    <Printer size={18} /> Ver para Imprimir
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
