'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    maxStock: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    addMultipleToCart: (newItems: { item: Omit<CartItem, 'quantity'>, quantity: number }[]) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Cargar carrito desde localStorage al iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsedItems = JSON.parse(savedCart);
                // Limpiar posibles duplicados o IDs vacíos que hayan quedado de errores anteriores
                const seen = new Set();
                const cleanItems = parsedItems.filter((item: CartItem) => {
                    if (!item.id || seen.has(item.id)) return false;
                    seen.add(item.id);
                    return true;
                });
                setItems(cleanItems);
            } catch (e) {
                console.error("Error cargando el carrito:", e);
                setItems([]);
            }
        }
    }, []);

    // Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id);

            if (existingItem) {
                // Verificar que no supere el stock máximo
                const newQuantity = Math.min(existingItem.quantity + quantity, item.maxStock);
                return prevItems.map(i =>
                    i.id === item.id ? { ...i, quantity: newQuantity } : i
                );
            } else {
                // Agregar nuevo item
                return [...prevItems, { ...item, quantity: Math.min(quantity, item.maxStock) }];
            }
        });

        // Abrir el carrito cuando se agrega algo
        setIsCartOpen(true);
    };

    const addMultipleToCart = (newItems: { item: Omit<CartItem, 'quantity'>, quantity: number }[]) => {
        setItems(prevItems => {
            let updatedItems = [...prevItems];

            newItems.forEach(({ item, quantity }) => {
                const existingIndex = updatedItems.findIndex(i => i.id === item.id);

                if (existingIndex >= 0) {
                    // Actualizar existente respetando stock
                    const currentItem = updatedItems[existingIndex];
                    const newQuantity = Math.min(currentItem.quantity + quantity, item.maxStock);
                    updatedItems[existingIndex] = { ...currentItem, quantity: newQuantity };
                } else {
                    // Agregar nuevo
                    updatedItems.push({ ...item, quantity: Math.min(quantity, item.maxStock) });
                }
            });

            return updatedItems;
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (id: string) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }

        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity: Math.min(quantity, item.maxStock) } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                addMultipleToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                isCartOpen,
                setIsCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart debe usarse dentro de un CartProvider');
    }
    return context;
}
