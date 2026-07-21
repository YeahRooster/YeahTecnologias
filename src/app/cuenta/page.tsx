'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Edit3, LogOut, Save, X, Printer, RotateCcw, Heart, Download, ShieldAlert, Send, RefreshCw } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos' | 'rma'>('perfil');

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
