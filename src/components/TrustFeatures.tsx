'use client';

import { ShieldCheck, Tag, MessageCircle } from 'lucide-react';
import { useWhiteLabel } from '@/context/WhiteLabelContext';
import styles from './TrustFeatures.module.css';

export default function TrustFeatures() {
    const { isWhiteLabel, brandName } = useWhiteLabel();

    return (
        <section className={styles.trustSection}>
            <div className={`container ${styles.grid}`}>
                <div className={styles.featureCard}>
                    <div className={styles.iconWrapper}>
                        <ShieldCheck size={28} color="#f59e0b" />
                    </div>
                    <div className={styles.textWrapper}>
                        <h3>{isWhiteLabel ? 'Garantía y Calidad' : 'Garantía y RMA 100% Online'}</h3>
                        <p>
                            {isWhiteLabel
                                ? 'Productos 100% probados y garantizados para tu total tranquilidad.'
                                : 'Cargá fallas y seguí el estado de tus garantías en tiempo real desde tu cuenta.'}
                        </p>
                    </div>
                </div>

                <div className={styles.featureCard}>
                    <div className={styles.iconWrapper}>
                        <Tag size={28} color="#2563eb" />
                    </div>
                    <div className={styles.textWrapper}>
                        <h3>{isWhiteLabel ? 'Los Mejores Precios' : 'Precios Mayoristas Directos'}</h3>
                        <p>
                            {isWhiteLabel
                                ? 'Precios competitivos, promociones constantes y stock disponible.'
                                : 'Sin intermediarios, catálogo con stock real y precios transparentes para tu local.'}
                        </p>
                    </div>
                </div>

                <div className={styles.featureCard}>
                    <div className={styles.iconWrapper}>
                        <MessageCircle size={28} color="#16a34a" />
                    </div>
                    <div className={styles.textWrapper}>
                        <h3>Atención y Asesoramiento</h3>
                        <p>
                            {isWhiteLabel
                                ? `Consultanos por WhatsApp y recibí atención directa de ${brandName || 'nuestro equipo'}.`
                                : 'Soporte personalizado para ayudarte a elegir los productos con mayor rotación.'}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
