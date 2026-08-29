'use client';

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, Package, Calculator, Book, Loader2, Instagram, Phone, Lock, Menu, X, Heart, Briefcase, Eye, EyeOff, Settings, Share2, Check, Sparkles, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useWhiteLabel } from "@/context/WhiteLabelContext";

interface ProductSimple {
    id: string;
    name: string;
    price: number;
    image: string;
}

export default function Header() {
    const router = useRouter();
    const { totalItems, setIsCartOpen } = useCart();
    const { favorites } = useFavorites();
    const {
        isWhiteLabel,
        profitMargin,
        brandName,
        brandLogo,
        whatsappNumber,
        isBarHidden,
        isClientSharedView,
        toggleWhiteLabel,
        setProfitMargin,
        setBrandName,
        setBrandLogo,
        setWhatsappNumber,
        toggleBarHidden,
        calculateRetailPrice,
        getShareableLink
    } = useWhiteLabel();

    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [tempBrandName, setTempBrandName] = useState(brandName);
    const [tempLogoUrl, setTempLogoUrl] = useState(brandLogo);
    const [tempWhatsapp, setTempWhatsapp] = useState(whatsappNumber);
    const [copiedShareLink, setCopiedShareLink] = useState(false);

    // Smart Search States
    const [products, setProducts] = useState<ProductSimple[]>([]);
    const [suggestions, setSuggestions] = useState<ProductSimple[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Cargar productos al inicio para el buscador rápido
    useEffect(() => {
        async function loadProducts() {
            setLoadingProducts(true);
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Error cargando productos para búsqueda", error);
            } finally {
                setLoadingProducts(false);
            }
        }
        loadProducts();
    }, []);

    // Estado de autorización para mostrar precios en el buscador
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Verificar autorización al montar y cuando cambie el localStorage (idealmente usaríamos un contexto, pero esto funciona rápido)
        const checkAuth = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user.habilitado) {
                        setIsAuthorized(true);
                        return;
                    }
                } catch (e) { }
            }
            setIsAuthorized(false);
        };

        checkAuth();
        // Escuchar cambios en localStorage (opcional, por si se loguea en otra pestaña)
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    // Filtrar al escribir
    useEffect(() => {
        if (searchQuery.length > 1) {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(lowerQuery)
            ).slice(0, 5); // Máximo 5 sugerencias
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchQuery, products]);

    // Cerrar sugerencias al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (searchQuery.trim()) {
            router.push(`/catalogo?buscar=${encodeURIComponent(searchQuery)}`);
            setIsMenuOpen(false); // Cerrar menú en móvil si se busca
        }
    };

    const handleSelectSuggestion = (productName: string) => {
        setSearchQuery(productName);
        setShowSuggestions(false);
        router.push(`/catalogo?buscar=${encodeURIComponent(productName)}`);
        setIsMenuOpen(false); // Cerrar menú en móvil
    };

    const handleCopyShareLink = () => {
        const link = getShareableLink();
        navigator.clipboard.writeText(link).then(() => {
            setCopiedShareLink(true);
            setTimeout(() => setCopiedShareLink(false), 2500);
        });
    };

    const handleSaveSettings = () => {
        setBrandName(tempBrandName);
        setBrandLogo(tempLogoUrl);
        setWhatsappNumber(tempWhatsapp);
        setShowSettingsModal(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <header className="header">
            {/* BOTÓN FLOTANTE PARA RESTAURAR BARRA SI FUE OCULTADA */}
            {isWhiteLabel && isBarHidden && !isClientSharedView && (
                <button
                    className="whitelabel-restore-float"
                    onClick={toggleBarHidden}
                    title="Mostrar barra de control de margen"
                >
                    <Eye size={16} />
                    <span>Modo Mostrador (+{profitMargin}%)</span>
                </button>
            )}

            {/* BARRA DE MODO MOSTRADOR / MARCA BLANCA (Visible para el comerciante si no está oculta) */}
            {isWhiteLabel && !isBarHidden && !isClientSharedView && (
                <div className="whitelabel-banner">
                    <div className="container whitelabel-content">
                        <div className="whitelabel-info">
                            <span>💼 MODO MOSTRADOR</span>
                            <span style={{ color: '#94a3b8', fontWeight: 400 }}>| {brandName} (+{profitMargin}%)</span>
                        </div>
                        <div className="whitelabel-controls">
                            <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Margen:</span>
                            {[30, 40, 50, 70].map(m => (
                                <button
                                    key={m}
                                    className={`whitelabel-preset-btn ${profitMargin === m ? 'active' : ''}`}
                                    onClick={() => setProfitMargin(m)}
                                >
                                    +{m}%
                                </button>
                            ))}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <input
                                    type="number"
                                    min="0"
                                    max="500"
                                    value={profitMargin}
                                    onChange={e => setProfitMargin(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="whitelabel-custom-input"
                                    title="Personalizar porcentaje"
                                />
                                <span style={{ fontSize: '0.8rem' }}>%</span>
                            </div>

                            {/* Botón Personalizar Local */}
                            <button
                                className="whitelabel-action-btn"
                                onClick={() => {
                                    setTempBrandName(brandName);
                                    setTempLogoUrl(brandLogo);
                                    setTempWhatsapp(whatsappNumber);
                                    setShowSettingsModal(true);
                                }}
                                title="Personalizá el nombre, logo y WhatsApp de tu local"
                            >
                                <Settings size={14} /> Mi Local
                            </button>

                            {/* Botón Compartir Catálogo para Clientes */}
                            <button
                                className="whitelabel-share-btn"
                                onClick={handleCopyShareLink}
                                title="Genera un enlace para enviarle a tus clientes por WhatsApp con tus precios ya aumentados"
                            >
                                {copiedShareLink ? <Check size={14} /> : <Share2 size={14} />}
                                <span>{copiedShareLink ? '¡Link Copiado!' : 'Compartir Catálogo'}</span>
                            </button>

                            {/* Botón Ocultar Barra */}
                            <button
                                className="whitelabel-preset-btn"
                                onClick={toggleBarHidden}
                                title="Ocultar barra superior para mostrar pantalla al cliente"
                            >
                                <EyeOff size={14} />
                            </button>

                            {/* Botón Salir */}
                            <button className="whitelabel-exit-btn" onClick={toggleWhiteLabel} title="Salir del Modo Mostrador">
                                <X size={14} /> Salir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!isWhiteLabel && (
                <div className="top-bar">
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p className="top-bar-text">📦 Envíos a todo el país | No es solo tecnología... ¡es Yeah!</p>
                        <div className="top-bar-socials">
                            <a href="https://www.instagram.com/yeahtecnologias/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', display: 'flex', alignItems: 'center' }} title="Instagram">
                                <Instagram size={18} />
                            </a>
                            <a href="https://wa.me/5493425924747" target="_blank" rel="noopener noreferrer" style={{ color: 'white', display: 'flex', alignItems: 'center' }} title="WhatsApp">
                                <Phone size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <div className="main-header container">
                <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0, minHeight: '45px' }}>
                    {isWhiteLabel ? (
                        brandLogo ? (
                            <img src={brandLogo} alt={brandName || 'Local'} className="reseller-custom-logo" style={{ maxHeight: '45px', maxWidth: '180px', objectFit: 'contain' }} />
                        ) : (
                            <div className="neutral-brand-logo" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                🛍️ {brandName && brandName !== 'Catálogo Digital' ? brandName : 'Catálogo Digital'}
                            </div>
                        )
                    ) : (
                        <img
                            src="/logo.jpg"
                            alt="Yeah! Tecnologías"
                            className="logo-img"
                            style={{ height: '45px', width: 'auto', maxHeight: '48px', maxWidth: '200px', objectFit: 'contain', display: 'block' }}
                        />
                    )}
                </Link>

                <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                <div className={`navigation-container ${isMenuOpen ? 'show' : ''}`}>
                    <div className="search-container" ref={searchRef}>
                        <form onSubmit={handleSearch} className="search-bar">
                            <input
                                type="text"
                                placeholder="¿Qué estás buscando?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                            />
                            <button type="submit">
                                {loadingProducts ? <Loader2 className="spin" size={20} /> : <Search size={20} />}
                            </button>
                        </form>

                        {/* SUGGESTIONS DROPDOWN */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="search-suggestions">
                                {suggestions.map(p => {
                                    const displayPrice = isWhiteLabel ? calculateRetailPrice(p.price) : p.price;
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => handleSelectSuggestion(p.name)}
                                            className="suggestion-item"
                                        >
                                            <div className="suggestion-img">
                                                {p.image ? (
                                                    <img src={p.image} alt="" />
                                                ) : (
                                                    <Package size={20} color="#94a3b8" />
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p className="suggestion-name">{p.name}</p>
                                                {isAuthorized || isWhiteLabel ? (
                                                    <p className="suggestion-price">${displayPrice.toLocaleString('es-AR')}</p>
                                                ) : (
                                                    <p className="suggestion-lock">
                                                        <Lock size={12} /> Solo mayoristas
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div onClick={handleSearch} className="view-all-results">
                                    Ver todos los resultados
                                </div>
                            </div>
                        )}
                    </div>

                    <nav className="nav-actions">
                        {/* Botón rápido Modo Mostrador: visible ÚNICAMENTE para el comerciante mayorista logueado (NUNCA para el consumidor final) */}
                        {isAuthorized && !isClientSharedView && !isWhiteLabel && (
                            <button
                                className={`nav-item whitelabel-toggle-btn`}
                                onClick={toggleWhiteLabel}
                                title="Activar modo mostrador (marca blanca con tu margen)"
                            >
                                <Briefcase size={18} />
                                <span>Modo Mostrador</span>
                            </button>
                        )}

                        <Link href="/catalogo" className="nav-item" onClick={() => setIsMenuOpen(false)}>
                            <Package size={24} className="nav-icon" />
                            <span>Catálogo</span>
                        </Link>
                        {!isWhiteLabel && (
                            <>
                                <Link href="/blog" className="nav-item" onClick={() => setIsMenuOpen(false)}>
                                    <Book size={24} className="nav-icon" />
                                    <span>Blog</span>
                                </Link>
                                <Link href="/calculadora" className="nav-item" onClick={() => setIsMenuOpen(false)}>
                                    <Calculator size={24} className="nav-icon" />
                                    <span>Calculadora</span>
                                </Link>
                            </>
                        )}
                        <Link href="/favoritos" className="nav-item" onClick={() => setIsMenuOpen(false)}>
                            <div className="cart-icon-wrapper">
                                <Heart size={24} className="nav-icon" />
                                {favorites.length > 0 && <span className="cart-badge">{favorites.length}</span>}
                            </div>
                            <span>Favoritos</span>
                        </Link>
                        {!isWhiteLabel && (
                            <Link href="/cuenta" className="nav-item" onClick={() => setIsMenuOpen(false)}>
                                <User size={24} className="nav-icon" />
                                <span>Mi Cuenta</span>
                            </Link>
                        )}
                        {!isWhiteLabel && (
                            <button className="nav-item cart-btn" onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }}>
                                <div className="cart-icon-wrapper">
                                    <ShoppingCart size={24} className="nav-icon" />
                                    {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                                </div>
                                <span>Carrito</span>
                            </button>
                        )}
                    </nav>
                </div>
            </div>

            {/* MODAL DE PERSONALIZACIÓN DEL LOCAL REVENDEDOR */}
            {showSettingsModal && (
                <div className="reseller-modal-overlay" onClick={() => setShowSettingsModal(false)}>
                    <div className="reseller-modal" onClick={e => e.stopPropagation()}>
                        <h3>
                            <Settings size={22} color="#0284c7" />
                            Personalizar Mi Local
                        </h3>
                        <p>Configurá los datos de tu negocio para que aparezcan en el catálogo que le compartís a tus clientes.</p>

                        <div className="reseller-form-group">
                            <label>Nombre de tu Negocio / Local:</label>
                            <input
                                type="text"
                                placeholder="Ej: TechStore Rosario"
                                value={tempBrandName}
                                onChange={e => setTempBrandName(e.target.value)}
                            />
                        </div>

                        <div className="reseller-form-group">
                            <label>Número de WhatsApp para pedidos de tus clientes (con código de país):</label>
                            <input
                                type="text"
                                placeholder="Ej: 5493421234567"
                                value={tempWhatsapp}
                                onChange={e => setTempWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                            />
                            <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                Tus clientes verán un botón directo para pedirte a tu WhatsApp con el producto y precio.
                            </small>
                        </div>

                        <div className="reseller-form-group">
                            <label>Logo de tu Local:</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    id="reseller-logo-upload"
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="reseller-logo-upload"
                                    className="whitelabel-action-btn"
                                    style={{ padding: '0.5rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                >
                                    <ImageIcon size={16} /> Subir Imagen desde la PC
                                </label>
                                {tempLogoUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setTempLogoUrl('')}
                                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}
                                    >
                                        Quitar Logo
                                    </button>
                                )}
                            </div>
                            {tempLogoUrl && (
                                <div style={{ padding: '0.5rem', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', background: '#0f172a' }}>
                                    <img src={tempLogoUrl} alt="Vista previa" style={{ maxHeight: '50px', maxWidth: '100%', objectFit: 'contain' }} />
                                    <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '4px' }}>Vista previa en cabecera oscura</p>
                                </div>
                            )}
                        </div>

                        <div className="reseller-modal-actions">
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                style={{ padding: '0.6rem 1rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                style={{ padding: '0.6rem 1.25rem', background: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                            >
                                Guardar Datos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
