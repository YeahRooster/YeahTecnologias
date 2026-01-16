'use client';

import { useState, useEffect } from 'react';
import { Printer, Download, ArrowLeft, Package, Lock } from "lucide-react";
import Link from "next/link";
import styles from "./lista-de-precios.module.css";

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
}

export default function ListaPreciosPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [fecha] = useState(new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }));

    useEffect(() => {
        // Verificar autorización
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.habilitado) {
                    setIsAuthorized(true);
                }
            } catch (e) { }
        }

        // Cargar productos
        async function fetchProducts() {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Error cargando productos:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <p>Generando lista de precios...</p>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <Lock size={48} style={{ marginBottom: '1rem', color: 'var(--accent)' }} />
                <h2>Acceso Restringido</h2>
                <p>Solo los clientes mayoristas autorizados pueden acceder a la lista de precios.</p>
                <Link href="/login" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                    Iniciar Sesión
                </Link>
            </div>
        );
    }

    // Agrupar por categoría
    const categories = Array.from(new Set(products.map(p => p.category)));

    return (
        <div className={styles.pageWrapper}>
            <div className={`container ${styles.noPrint}`}>
                <div className={styles.headerActions}>
                    <Link href="/cuenta" className={styles.backBtn}>
                        <ArrowLeft size={20} /> Volver a Mi Cuenta
                    </Link>
                    <button onClick={handlePrint} className="btn btn-primary">
                        <Printer size={20} style={{ marginRight: '0.5rem' }} /> Imprimir / Guardar PDF
                    </button>
                </div>
            </div>

            <div className={styles.printableArea}>
                <div className={styles.brandHeader}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 className={styles.brandTitle}>Yeah! Tecnologías</h1>
                            <p className={styles.brandSlogan}>No es solo tecnología... es Yeah!</p>
                            <p className={styles.contactInfo}>Santa Fe, Argentina | WhatsApp: +54 9 342 592 4747</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 className={styles.documentTitle}>LISTA DE PRECIOS MAYORISTA</h2>
                            <p className={styles.dateInfo}>Actualizada al: {fecha}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.disclaimer}>
                    * Precios sujetos a cambios sin previo aviso. Valores expresados en Pesos Argentinos (ARS).
                </div>

                {categories.sort().map(cat => (
                    <div key={cat} className={styles.categorySection}>
                        <h3 className={styles.categoryTitle}>{cat}</h3>
                        <table className={styles.priceTable}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', width: '100px' }}>ID</th>
                                    <th style={{ textAlign: 'left' }}>Descripción</th>
                                    <th style={{ textAlign: 'right', width: '120px' }}>Precio</th>
                                    <th style={{ textAlign: 'center', width: '100px' }}>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products
                                    .filter(p => p.category === cat)
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map(product => (
                                        <tr key={product.id}>
                                            <td>{product.id}</td>
                                            <td>{product.name}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                                ${product.price.toLocaleString('es-AR')}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {product.stock > 0 ? (
                                                    <span className={styles.stockLabel}>Disponible</span>
                                                ) : (
                                                    <span className={styles.outOfStockLabel}>Sin Stock</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ))}

                <div className={styles.footerPrint}>
                    <p>Ya podés hacer tu pedido online en <strong>www.yeahtecnologias.com</strong></p>
                    <p>Muchas gracias por confiar en nosotros.</p>
                </div>
            </div>
        </div>
    );
}
