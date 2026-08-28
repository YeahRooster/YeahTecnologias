'use client';

import { MessageCircle } from 'lucide-react';
import { useWhiteLabel } from '@/context/WhiteLabelContext';
import styles from './WhatsAppButton.module.css';

export default function WhatsAppButton() {
    const { isWhiteLabel, whatsappNumber, brandName } = useWhiteLabel();

    // Si está en Modo Marca Blanca:
    if (isWhiteLabel) {
        // Si el revendedor configuró su WhatsApp, el botón flotante va a su WhatsApp
        if (whatsappNumber) {
            const resellerMsg = `Hola ${brandName || ''}, estoy viendo su catálogo y tengo una consulta.`;
            const resellerUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(resellerMsg)}`;

            return (
                <a
                    href={resellerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappFloat}
                    aria-label={`Contactar a ${brandName || 'Local'} por WhatsApp`}
                >
                    <MessageCircle size={32} />
                    <span className={styles.label}>¿Consultas?</span>
                </a>
            );
        }
        // Si no tiene WhatsApp cargado, NO mostrar el botón flotante institucional
        return null;
    }

    // Modo normal mayorista: apunta a Yeah! Tecnologías
    const phoneNumber = '5493425924747';
    const message = 'Hola Yeah! Tecnologías, estoy viendo su web y tengo una consulta.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappFloat}
            aria-label="Contactar por WhatsApp"
        >
            <MessageCircle size={32} />
            <span className={styles.label}>¿Consultas?</span>
        </a>
    );
}
