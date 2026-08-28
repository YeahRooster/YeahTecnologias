'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WhiteLabelContextType {
    isWhiteLabel: boolean;
    profitMargin: number;
    brandName: string;
    brandLogo: string;
    whatsappNumber: string;
    isBarHidden: boolean;
    isClientSharedView: boolean;
    toggleWhiteLabel: () => void;
    setProfitMargin: (margin: number) => void;
    setBrandName: (name: string) => void;
    setBrandLogo: (logo: string) => void;
    setWhatsappNumber: (phone: string) => void;
    toggleBarHidden: () => void;
    calculateRetailPrice: (costPrice: number) => number;
    getShareableLink: () => string;
}

const WhiteLabelContext = createContext<WhiteLabelContextType | undefined>(undefined);

export function WhiteLabelProvider({ children }: { children: React.ReactNode }) {
    const [isWhiteLabel, setIsWhiteLabel] = useState(false);
    const [profitMargin, setProfitMarginState] = useState<number>(40); // Margen por defecto: 40%
    const [brandName, setBrandNameState] = useState<string>('Catálogo Digital');
    const [brandLogo, setBrandLogoState] = useState<string>('');
    const [whatsappNumber, setWhatsappNumberState] = useState<string>('');
    const [isBarHidden, setIsBarHidden] = useState<boolean>(false);
    const [isClientSharedView, setIsClientSharedView] = useState<boolean>(false);

    useEffect(() => {
        // 1. Detectar si viene por URL compartida (vista para el cliente final del revendedor)
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const mParam = params.get('m');
            const localParam = params.get('local');
            const telParam = params.get('tel');
            const logoParam = params.get('logo');
            const modoParam = params.get('modo');

            if (mParam || modoParam === 'catalogo') {
                setIsWhiteLabel(true);
                setIsClientSharedView(true);
                setIsBarHidden(true); // Ocultar barra de administración para el cliente final

                if (mParam) {
                    const parsedM = parseFloat(mParam);
                    if (!isNaN(parsedM) && parsedM >= 0) setProfitMarginState(parsedM);
                }
                if (localParam) setBrandNameState(decodeURIComponent(localParam));
                if (telParam) setWhatsappNumberState(decodeURIComponent(telParam));
                if (logoParam) setBrandLogoState(decodeURIComponent(logoParam));
                return;
            }
        }

        // 2. Si no es URL compartida, cargar configuración guardada en localStorage del comerciante
        const savedMode = localStorage.getItem('mode_whitelabel');
        const savedMargin = localStorage.getItem('whitelabel_margin');
        const savedName = localStorage.getItem('whitelabel_name');
        const savedLogo = localStorage.getItem('whitelabel_logo');
        const savedPhone = localStorage.getItem('whitelabel_phone');
        const savedBarHidden = localStorage.getItem('whitelabel_bar_hidden');

        if (savedMode === 'true') setIsWhiteLabel(true);
        if (savedMargin) {
            const parsed = parseFloat(savedMargin);
            if (!isNaN(parsed) && parsed >= 0) setProfitMarginState(parsed);
        }
        if (savedName) setBrandNameState(savedName);
        if (savedLogo) setBrandLogoState(savedLogo);
        if (savedPhone) setWhatsappNumberState(savedPhone);
        if (savedBarHidden === 'true') setIsBarHidden(true);
    }, []);

    const toggleWhiteLabel = () => {
        setIsWhiteLabel(prev => {
            const next = !prev;
            localStorage.setItem('mode_whitelabel', next ? 'true' : 'false');
            return next;
        });
    };

    const setProfitMargin = (margin: number) => {
        setProfitMarginState(margin);
        localStorage.setItem('whitelabel_margin', margin.toString());
    };

    const setBrandName = (name: string) => {
        setBrandNameState(name);
        localStorage.setItem('whitelabel_name', name);
    };

    const setBrandLogo = (logo: string) => {
        setBrandLogoState(logo);
        localStorage.setItem('whitelabel_logo', logo);
    };

    const setWhatsappNumber = (phone: string) => {
        setWhatsappNumberState(phone);
        localStorage.setItem('whitelabel_phone', phone);
    };

    const toggleBarHidden = () => {
        setIsBarHidden(prev => {
            const next = !prev;
            localStorage.setItem('whitelabel_bar_hidden', next ? 'true' : 'false');
            return next;
        });
    };

    const calculateRetailPrice = (costPrice: number) => {
        if (!isWhiteLabel || isNaN(costPrice) || costPrice <= 0) return costPrice;
        const multiplier = 1 + profitMargin / 100;
        return Math.round(costPrice * multiplier);
    };

    const getShareableLink = () => {
        if (typeof window === 'undefined') return '';
        // Si está en producción, usamos el dominio neutro asignado en Vercel
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocalhost ? window.location.origin : 'https://mitienda-digital.vercel.app';

        const params = new URLSearchParams();
        params.set('modo', 'catalogo');
        params.set('m', profitMargin.toString());
        if (brandName && brandName !== 'Catálogo Digital') params.set('local', brandName);
        if (whatsappNumber) params.set('tel', whatsappNumber);
        if (brandLogo && brandLogo.startsWith('http')) params.set('logo', brandLogo);

        return `${baseUrl}/catalogo?${params.toString()}`;
    };

    return (
        <WhiteLabelContext.Provider
            value={{
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
                getShareableLink,
            }}
        >
            {children}
        </WhiteLabelContext.Provider>
    );
}

export function useWhiteLabel() {
    const context = useContext(WhiteLabelContext);
    if (!context) {
        throw new Error('useWhiteLabel debe ser utilizado dentro de un WhiteLabelProvider');
    }
    return context;
}
