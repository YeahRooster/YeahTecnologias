'use client';

import { MessageCircle } from 'lucide-react';
import styles from './WhatsAppButton.module.css';

export default function WhatsAppButton() {
    // Reemplazar este número por el real de Yeah! Tecnologías
    // Formato: 549 + código de área sin 0 + número sin 15
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
