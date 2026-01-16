'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FavoriteProduct {
    id: string;
    name: string;
    price: number;
    image?: string;
    category: string;
    stock?: number;
}

interface FavoritesContextType {
    favorites: FavoriteProduct[];
    toggleFavorite: (product: FavoriteProduct) => void;
    isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);

    // Cargar favoritos desde localStorage al iniciar
    useEffect(() => {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            try {
                setFavorites(JSON.parse(savedFavorites));
            } catch (e) {
                console.error("Error cargando favoritos:", e);
            }
        }
    }, []);

    // Guardar favoritos en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (product: FavoriteProduct) => {
        setFavorites(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) {
                return prev.filter(p => p.id !== product.id);
            } else {
                return [...prev, product];
            }
        });
    };

    const isFavorite = (id: string) => favorites.some(p => p.id === id);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites debe usarse dentro de un FavoritesProvider');
    }
    return context;
}
