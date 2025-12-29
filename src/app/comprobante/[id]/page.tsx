'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import styles from '../comprobante.module.css';

interface OrderItem {
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
}

interface OrderDetail {
    order: {
        idPedido: string;
        fecha: string;
        email: string;
        productos: string;
        total: number;
        estado: string;
    };
    items: OrderItem[];
    customer: {
        nombre: string;
        local: string;
        direccion: string;
        localidad: string;
        telefono: string;
        cuit: string;
    } | null;
}

export default function ComprobantePage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (params.id) {
            fetchOrder();
        }
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${params.id}`);
            if (!res.ok) throw new Error('No se encontró el pedido');
            const jsonData = await res.json();
            setData(jsonData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <Loader2 size={40} className="spin" />
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error || !data) return <div style={{ textAlign: 'center', marginTop: '50px' }}>❌ {error || 'Error desconocido'}</div>;

    const { order, items, customer } = data;

    return (
        <div className={styles.body}>
            {/* ESTILOS GLOBALES DE IMPRESIÓN INYECTADOS AQUI */}
            <style jsx global>{`
                @media print {
                    /* Ocultar elementos globales de la web */
                    nav, header, footer, aside, .floating-btn, [class*="PriceWarning"], [class*="Header"], [class*="WhatsApp"] { 
                        display: none !important; 
                    }
                    /* Ocultar barra de desplazamiento */
                    html, body { 
                        height: auto; 
                        overflow: visible; 
                        background: white !important;
                    }
                    /* Asegurar que el contenido del comprobante sea visible y ocupe todo */
                    #__next, main, .layout-container { 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        width: 100% !important;
                    }
                }
            `}</style>

            <div className={styles.printControls}>
                <button onClick={() => router.back()} className={`${styles.btn} ${styles.btnClose}`}>
                    <ArrowLeft size={18} /> Volver
                </button>
                <button onClick={() => window.print()} className={`${styles.btn} ${styles.btnPrint}`}>
                    <Printer size={18} /> Imprimir Remito
                </button>
            </div>

            <div className={styles.container} id="printableArea">
                {/* HEADER */}
                <div className={styles.header}>
                    <div className={styles.logoArea}>
                        <h1>YEAH! TECNOLOGÍAS</h1>
                        <p>Insumos tecnológicos al por mayor</p>
                        <p>Santa Fe, Argentina - Tel: 342 592 4747</p>
                        <p>Email: ventas@yeahtecnologias.com</p>
                    </div>
                    <div className={styles.invoiceInfo}>
                        <h2 className={styles.invoiceTitle}>REMITO X</h2>
                        <div className={styles.invoiceDetails}>
                            <p><strong>N° Pedido:</strong> {order.idPedido}</p>
                            <p><strong>Fecha:</strong> {order.fecha}</p>
                            <p><strong>Estado:</strong> {order.estado}</p>
                        </div>
                    </div>
                </div>

                {/* CLIENTE */}
                <div className={styles.clientSection}>
                    <h3 className={styles.sectionTitle}>Datos del Cliente</h3>
                    <div className={styles.clientDetails}>
                        <div className={styles.col}>
                            <p className={styles.clientLine}><strong>Razón Social / Nombre:</strong> {customer?.nombre || 'Consumidor Final'}</p>
                            <p className={styles.clientLine}><strong>Nombre Local:</strong> {customer?.local || '-'}</p>
                            <p className={styles.clientLine}><strong>CUIT/CUIL:</strong> {customer?.cuit || '-'}</p>
                        </div>
                        <div className={styles.col}>
                            <p className={styles.clientLine}><strong>Dirección:</strong> {customer?.direccion || '-'}</p>
                            <p className={styles.clientLine}><strong>Localidad:</strong> {customer?.localidad || '-'}</p>
                            <p className={styles.clientLine}><strong>Teléfono:</strong> {customer?.telefono || '-'}</p>
                            <p className={styles.clientLine}><strong>Email:</strong> {order.email}</p>
                        </div>
                    </div>
                </div>

                {/* TABLA DETALLADA */}
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.colCenter} style={{ width: '10%' }}>CANT.</th>
                            <th style={{ width: '50%' }}>DESCRIPCIÓN</th>
                            <th className={styles.colRight} style={{ width: '20%' }}>PRECIO UNIT.</th>
                            <th className={styles.colRight} style={{ width: '20%' }}>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items && items.map((item, idx) => (
                            <tr key={idx}>
                                <td className={styles.colCenter}>{item.cantidad}</td>
                                <td>{item.nombre}</td>
                                <td className={styles.colRight}>
                                    {item.precioUnitario > 0 ? `$${item.precioUnitario.toLocaleString('es-AR')}` : '-'}
                                </td>
                                <td className={styles.colRight}>
                                    {item.total > 0 ? `$${item.total.toLocaleString('es-AR')}` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* TOTALES */}
                <div className={styles.totals}>
                    <div className={styles.totalsBox}>
                        <div className={styles.totalRow}>
                            <span>TOTAL</span>
                            <span>${order.total.toLocaleString('es-AR')}</span>
                        </div>
                        <p style={{ fontSize: '11px', marginTop: '10px', color: '#666', fontStyle: 'italic' }}>
                            * Precios sujetos a modificación según cotización del dólar al momento del pago efectivo. Documento no válido como factura.
                        </p>
                    </div>
                </div>

                {/* FOOTER */}
                <div className={styles.footer}>
                    <p>Gracias por confiar en Yeah! Tecnologías.</p>
                </div>
            </div>
        </div>
    );
}
