'use client';

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, Package, Calculator, Book, Loader2, Instagram, Phone, Lock, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface ProductSimple {
    id: string;
    name: string;
    price: number;
    image: string;
}

export default function Header() {
    const router = useRouter();
    const { totalItems, setIsCartOpen } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    return (
        <header className="header">
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

            <div className="main-header container">
                <div className="logo-wrapper">
                    <Link href="/" className="logo">
                        <img src="/logo.jpg" alt="Yeah! Tecnologías" className="logo-img" />
                    </Link>

                    <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

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
                                {suggestions.map(p => (
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
                                            {isAuthorized ? (
                                                <p className="suggestion-price">${p.price.toLocaleString('es-AR')}</p>
                                            ) : (
                                                <p className="suggestion-lock">
                                                    <Lock size={12} /> Solo mayoristas
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div onClick={handleSearch} className="view-all-results">
                                    Ver todos los resultados
                                </div>
                            </div>
                        )}
                    </div>

                    <nav className="nav-actions">
                        <Link href="/catalogo" className="nav-item" onClick={() => setIsMenuOpen(false)}>
                            <Package size={24} className="nav-icon" />
                            <span>Catálogo</span>
                        </Link>
                        <Link href="/blog" className="nav-item" onClick={() => setIsMenuOpen(false)}>
                            <Book size={24} className="nav-icon" />
                            <span>Blog</span>
                        </Link>
                        <Link href="/calculadora" className="nav-item" onClick={() => setIsMenuOpen(false)}>
                            <Calculator size={24} className="nav-icon" />
                            <span>Calculadora</span>
                        </Link>
                        <Link href="/cuenta" className="nav-item" onClick={() => setIsMenuOpen(false)}>
                            <User size={24} className="nav-icon" />
                            <span>Mi Cuenta</span>
                        </Link>
                        <button className="nav-item cart-btn" onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }}>
                            <div className="cart-icon-wrapper">
                                <ShoppingCart size={24} className="nav-icon" />
                                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                            </div>
                            <span>Carrito</span>
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
}
