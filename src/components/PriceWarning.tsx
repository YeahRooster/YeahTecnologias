'use client';

import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function PriceWarning() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '0.5rem 1rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            borderBottom: '1px solid #ffeeba',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: '500'
        }}>
            <AlertTriangle size={16} />
            <span>
                Atención: Los precios pueden sufrir cambios sin previo aviso, sujetos a la cotización del dólar.
            </span>
            <button
                onClick={() => setIsVisible(false)}
                style={{
                    background: 'none',
                    border: 'none',
                    columns: 'inherit',
                    cursor: 'pointer',
                    position: 'absolute',
                    right: '1rem',
                    opacity: 0.5,
                    fontSize: '1.2rem',
                    lineHeight: 1
                }}
                aria-label="Cerrar aviso"
            >
                &times;
            </button>
        </div>
    );
}
