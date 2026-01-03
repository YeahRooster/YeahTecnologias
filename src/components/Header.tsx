'use client';

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, Package, Calculator, Book, Loader2, Instagram, Phone } from "lucide-react";
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
        }
    };

    const handleSelectSuggestion = (productName: string) => {
        setSearchQuery(productName);
        setShowSuggestions(false);
        router.push(`/catalogo?buscar=${encodeURIComponent(productName)}`);
    };

    return (
        <header className="header">
            <div className="top-bar">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0 }}>📦 Envíos a todo el país | No es solo tecnología... ¡es Yeah!</p>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                <Link href="/" className="logo">
                    <img src="/logo.jpg" alt="Yeah! Tecnologías" className="logo-img" />
                </Link>

                <div className="search-container" ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
                    <form onSubmit={handleSearch} className="search-bar" style={{ width: '100%', marginBottom: 0 }}>
                        <input
                            type="text"
                            placeholder="¿Qué estás buscando? (ej. auriculares, ram...)"
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
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            borderRadius: '0 0 8px 8px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            zIndex: 50,
                            border: '1px solid #e2e8f0',
                            borderTop: 'none',
                            marginTop: '4px',
                            padding: '0.5rem 0',
                            overflow: 'hidden'
                        }}>
                            {suggestions.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => handleSelectSuggestion(p.name)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.75rem 1rem',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        borderBottom: '1px solid #f1f5f9'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        {p.image ? (
                                            <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <Package size={20} color="#94a3b8" />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: 500, color: '#1e293b', fontSize: '0.9rem' }}>{p.name}</p>
                                        <p style={{ margin: 0, color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>${p.price.toLocaleString('es-AR')}</p>
                                    </div>
                                </div>
                            ))}
                            <div
                                onClick={handleSearch}
                                style={{
                                    padding: '0.75rem',
                                    textAlign: 'center',
                                    color: '#2563eb',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    borderTop: '1px solid #e2e8f0',
                                    backgroundColor: '#eff6ff'
                                }}
                            >
                                Ver todos los resultados para "{searchQuery}"
                            </div>
                        </div>
                    )}
                </div>

                <nav className="nav-actions">
                    <Link href="/catalogo" className="nav-item">
                        <Package size={24} />
                        <span>Catálogo</span>
                    </Link>
                    <Link href="/blog" className="nav-item">
                        <Book size={24} />
                        <span>Blog</span>
                    </Link>
                    <Link href="/calculadora" className="nav-item">
                        <Calculator size={24} />
                        <span>Calculadora</span>
                    </Link>
                    <Link href="/cuenta" className="nav-item">
                        <User size={24} />
                        <span>Mi Cuenta</span>
                    </Link>
                    <button className="nav-item cart-btn" onClick={() => setIsCartOpen(true)}>
                        <div className="cart-icon-wrapper">
                            <ShoppingCart size={24} />
                            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                        </div>
                        <span>Carrito</span>
                    </button>
                </nav>
            </div>
        </header>
    );
}
