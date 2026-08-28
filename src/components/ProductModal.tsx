'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Check, X, Bell, ChevronLeft, ChevronRight, Download, Copy, Share2, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWhiteLabel } from "@/context/WhiteLabelContext";
import styles from "./ProductModal.module.css";

interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
    images?: string[];
    category: string;
    stock?: number;
    description?: string;
}

interface ProductModalProps {
    product: Product;
    onClose: () => void;
    isAuthorized?: boolean;
}

export default function ProductModal({ product, onClose, isAuthorized = false }: ProductModalProps) {
    const { addToCart } = useCart();
    const { isWhiteLabel, calculateRetailPrice, brandName, whatsappNumber, isClientSharedView } = useWhiteLabel();
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [copiedKit, setCopiedKit] = useState(false);
    const [downloadingImg, setDownloadingImg] = useState(false);

    const maxStock = product.stock || 0;
    const outOfStock = maxStock <= 0;
    const allImages = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);

    const handleAddToCart = () => {
        if (outOfStock) return;

        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            maxStock: maxStock,
        }, quantity);

        setAdded(true);
        setTimeout(() => {
            setAdded(false);
        }, 1500);
    };

    // Descarga de imagen con nombre personalizado y limpio
    const handleDownloadCleanImage = async () => {
        const currentImgUrl = allImages[activeImageIndex] || product.image;
        if (!currentImgUrl) return;

        setDownloadingImg(true);
        try {
            // Sanitizar nombre de archivo
            const cleanName = product.name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            const filename = `${cleanName}-yeah-tecnologias.jpg`;

            const res = await fetch(currentImgUrl);
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Error descargando imagen:", err);
            // Fallback directo
            const a = document.createElement('a');
            a.href = currentImgUrl;
            a.target = "_blank";
            a.download = `${product.name}.jpg`;
            a.click();
        } finally {
            setDownloadingImg(false);
        }
    };

    // Copiar ficha comercial optimizada para redes
    const handleCopySocialKit = () => {
        const displayPrice = calculateRetailPrice(product.price);
        const text = `🔥 *${product.name.toUpperCase()}*\n\n` +
            `📌 *Categoría:* ${product.category}\n` +
            `✨ *Detalle:* ${product.description || 'Excelente calidad y garantía garantizada.'}\n\n` +
            `💰 *Precio:* $${displayPrice.toLocaleString('es-AR')}\n\n` +
            `📍 ¡Consultanos por stock y envíos por WhatsApp! 📲`;

        navigator.clipboard.writeText(text).then(() => {
            setCopiedKit(true);
            setTimeout(() => setCopiedKit(false), 2000);
        });
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    // Cerrar con Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={24} />
                </button>

                <div className={styles.grid}>
                    <div className={styles.imageSection}>
                        <div className={styles.mainImageWrapper}>
                            {allImages.length > 0 ? (
                                <>
                                    <img
                                        src={allImages[activeImageIndex]}
                                        alt={product.name}
                                        className={styles.mainImage}
                                    />
                                    {allImages.length > 1 && (
                                        <>
                                            <button className={styles.navBtnLeft} onClick={handlePrev}>
                                                <ChevronLeft size={24} />
                                            </button>
                                            <button className={styles.navBtnRight} onClick={handleNext}>
                                                <ChevronRight size={24} />
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className={styles.placeholder}>Sin Imagen</div>
                            )}
                        </div>

                        {allImages.length > 1 && (
                            <div className={styles.thumbnails}>
                                {allImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={`${styles.thumbnail} ${idx === activeImageIndex ? styles.activeThumbnail : ''}`}
                                        onClick={() => setActiveImageIndex(idx)}
                                    >
                                        <img src={img} alt={`Vista ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.category}>{product.category}</div>
                        <h2 className={styles.title}>{product.name}</h2>

                        {isAuthorized || isWhiteLabel ? (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                <div className={styles.price}>
                                    ${(isWhiteLabel ? calculateRetailPrice(product.price) : product.price).toLocaleString('es-AR')}
                                </div>
                                {isWhiteLabel && (
                                    <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700 }}>
                                        Precio Venta Público Sugerido
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className={styles.lockedPriceMain}>
                                <span className={styles.blurredPriceLarge}>$ 00.000,00</span>
                                <div className={styles.lockNotice}>
                                    🔒 Debes estar logueado y habilitado por el administrador para ver precios mayoristas.
                                </div>
                            </div>
                        )}

                        <div className={styles.description}>
                            {product.description || 'Sin descripción disponible.'}
                        </div>

                        {/* PACK PARA REVENDEDORES: DESCARGA DE FOTO + COPY PARA REDES (Visible solo para el revendedor) */}
                        {!isClientSharedView && (isAuthorized || isWhiteLabel) && (
                            <div className={styles.resellerToolkit}>
                                <div className={styles.resellerHeader}>
                                    <Sparkles size={16} color="#f59e0b" />
                                    <span>Pack para Revendedores</span>
                                </div>
                                <div className={styles.resellerActions}>
                                    <button
                                        className={styles.resellerBtn}
                                        onClick={handleDownloadCleanImage}
                                        disabled={downloadingImg}
                                        title="Descarga la foto en alta calidad con nombre limpio para tus publicaciones"
                                    >
                                        <Download size={16} />
                                        <span>{downloadingImg ? 'Descargando...' : 'Descargar Foto'}</span>
                                    </button>

                                    <button
                                        className={`${styles.resellerBtn} ${copiedKit ? styles.copied : ''}`}
                                        onClick={handleCopySocialKit}
                                        title="Copia el texto del producto listo para pegar en WhatsApp o Instagram"
                                    >
                                        {copiedKit ? <Check size={16} /> : <Copy size={16} />}
                                        <span>{copiedKit ? '¡Texto Copiado!' : 'Copiar Texto para Redes'}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* BOTÓN DE PEDIDO DIRECTO POR WHATSAPP PARA CLIENTES DEL REVENDEDOR */}
                        {isWhiteLabel && whatsappNumber && (
                            <div style={{ marginTop: '1.25rem' }}>
                                <a
                                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola ${brandName || ''}! Me interesa consultar por el producto: *${product.name}* ($${calculateRetailPrice(product.price).toLocaleString('es-AR')}). ¿Tenés disponible?`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        background: '#25D366',
                                        color: 'white',
                                        padding: '0.85rem 1.25rem',
                                        borderRadius: '10px',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        textDecoration: 'none',
                                        boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)',
                                    }}
                                >
                                    <Share2 size={20} /> Pedir por WhatsApp a {brandName || 'Local'}
                                </a>
                            </div>
                        )}

                        {!isWhiteLabel && isAuthorized && !outOfStock && (
                            <div className={styles.actions}>
                                <div className={styles.quantitySelector}>
                                    <button
                                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                        className={styles.qtyBtn}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className={styles.qtyValue}>{quantity}</span>
                                    <button
                                        onClick={() => quantity < maxStock && setQuantity(quantity + 1)}
                                        className={styles.qtyBtn}
                                        disabled={quantity >= maxStock}
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <button
                                    className={`${styles.addButton} ${added ? styles.added : ''}`}
                                    onClick={handleAddToCart}
                                    disabled={added}
                                >
                                    {added ? (
                                        <>
                                            <Check size={20} /> Agregado al carrito
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={20} /> Agregar al Carrito
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {!isWhiteLabel && isAuthorized && outOfStock && (
                            <div className={styles.outOfStockMessage}>
                                <Bell size={20} />
                                <span>Este producto no tiene stock actualmente.</span>
                            </div>
                        )}

                        {!isAuthorized && !isWhiteLabel && (
                            <div className={styles.registerPrompt}>
                                <p>¿Eres cliente mayorista?</p>
                                <a href="/cuenta" className={styles.loginLink}>Inicia sesión o regístrate aquí</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
