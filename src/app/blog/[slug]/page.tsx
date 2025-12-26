'use client';

import { use } from 'react';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import styles from './article.module.css';

// Base de datos de artículos (simulada)
const articlesDB: { [key: string]: any } = {
    'como-vender-auriculares-gamer': {
        title: 'Cómo vender auriculares gamer en 2025',
        date: '15 de Diciembre, 2025',
        readTime: '5 min',
        category: 'Guías de Venta',
        content: `
      <h2>🎧 Por qué los auriculares gamer son una oportunidad</h2>
      <p>El mercado gamer en Argentina está en pleno crecimiento. Los auriculares gaming no son solo un accesorio, son una **herramienta esencial** para streamers, jugadores competitivos y creadores de contenido.</p>
      
      <h2>💰 Estrategias de venta efectivas</h2>
      
      <h3>1. Conocé tu producto</h3>
      <p>Antes de vender, asegurate de conocer:</p>
      <ul>
        <li><strong>Conectividad:</strong> USB, 3.5mm, Bluetooth, inalámbrico 2.4GHz</li>
        <li><strong>Características técnicas:</strong> Drivers, respuesta de frecuencia, micrófono boom vs. integrado</li>
        <li><strong>Compatibilidad:</strong> PC, consolas (PS5, Xbox, Switch), celulares</li>
      </ul>

      <h3>2. Destacá beneficios, no solo características</h3>
      <p>En lugar de decir "Driver de 50mm", explicá que <strong>"escucharás cada paso del enemigo con claridad total"</strong>.</p>

      <h3>3. Creá urgencia con stock limitado</h3>
      <p>Si tenés pocas unidades, comunicalo: "Solo quedan 3 unidades en esta promo".</p>

      <h2>📱 Cómo promocionar en redes</h2>
      <p>Usá videos cortos mostrando:</p>
      <ul>
        <li>Unboxing del producto</li>
        <li>Prueba de sonido (especialmente en juegos populares)</li>
        <li>Comparación con otros modelos</li>
      </ul>

      <h2>✅ Checklist antes de publicar</h2>
      <ul>
        <li>✓ Fotos de alta calidad (mínimo 3 ángulos)</li>
        <li>✓ Especificaciones técnicas completas</li>
        <li>✓ Precio competitivo (usá nuestra Calculadora de Márgenes)</li>
        <li>✓ Información de garantía clara</li>
      </ul>

      <div class="tip-box">
        <strong>💡 Tip de Yeah!:</strong> Ofrecé un "combo gamer" con mouse pad + auriculares. Aumentás el ticket promedio sin esfuerzo extra.
      </div>
    `,
    },
    'errores-comunes-revender-celulares': {
        title: '5 errores que todo revendedor de celulares debe evitar',
        date: '12 de Diciembre, 2025',
        readTime: '4 min',
        category: 'Consejos',
        content: `
      <h2>📱 Error #1: No verificar IMEI antes de comprar</h2>
      <p>Siempre verificá el IMEI en la base de datos de la marca. Un celular reportado es imposible de revender legalmente.</p>

      <h2>❌ Error #2: Ignorar el estado de la batería</h2>
      <p>Un celular con batería degradada (<80%) pierde valor. Informá el estado de batería en tu publicación para evitar reclamos.</p>

      <h2>💸 Error #3: Poner un margen demasiado alto</h2>
      <p>En celulares, la competencia es feroz. Margen recomendado: <strong>15-25% máximo</strong>, dependiendo del modelo.</p>

      <h2>📸 Error #4: Fotos genéricas de internet</h2>
      <p>Sacá fotos reales del equipo. Los compradores desconfían de imágenes de catálogo.</p>

      <h2>🚚 Error #5: No ofrecer garantía</h2>
      <p>Aunque sea 7 días de garantía básica, genera confianza y reduce devoluciones.</p>

      <div class="tip-box">
        <strong>💡 Recurso Yeah!:</strong> Descargá nuestro checklist de inspección de celulares antes de publicar.
      </div>
    `,
    },
    'tendencias-tech-2025': {
        title: 'Tendencias tech que tus clientes buscan en 2025',
        date: '10 de Diciembre, 2025',
        readTime: '6 min',
        category: 'Tendencias',
        content: `
      <h2>🔥 Lo más buscado en 2025</h2>

      <h3>1. Auriculares con Cancelación de Ruido Activa (ANC)</h3>
      <p>Ya no es exclusivo de gama alta. Auriculares con ANC de presupuesto medio están explotando en ventas.</p>

      <h3>2. Monitores ultrawide y gaming</h3>
      <p>El home office + gaming impulsan la demanda de pantallas de 27" o más, con 144Hz mínimo.</p>

      <h3>3. Cargadores GaN de alta potencia</h3>
      <p>Los cargadores GaN (Nitruro de Galio) son compactos, potentes y cada vez más populares.</p>

      <h3>4. Smart Home en Argentina</h3>
      <p>Luces RGB, cerraduras inteligentes y cámaras WiFi están dejando de ser "lujo" para volverse mainstream.</p>

      <h2>🎯 Qué stockear para el verano</h2>
      <ul>
        <li>Coolers para notebook (el calor hace estragos)</li>
        <li>Powerbanks de alta capacidad (viajes y cortes de luz)</li>
        <li>Parlantes Bluetooth resistentes al agua</li>
      </ul>

      <div class="tip-box">
        <strong>💡 Insider Yeah!:</strong> Accedé a nuestro programa de preventa para Partners y asegurá stock de productos en tendencia antes que tu competencia.
      </div>
    `,
    },
};

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const article = articlesDB[slug];

    if (!article) {
        return (
            <div className={styles.container}>
                <div className={styles.notFound}>
                    <h1>Artículo no encontrado</h1>
                    <Link href="/blog" className={styles.backLink}>
                        <ArrowLeft size={20} />
                        Volver al blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Link href="/blog" className={styles.backLink}>
                <ArrowLeft size={20} />
                Volver al blog
            </Link>

            <article className={styles.article}>
                <header className={styles.header}>
                    <span className={styles.category}>{article.category}</span>
                    <h1>{article.title}</h1>
                    <div className={styles.meta}>
                        <span>
                            <Calendar size={16} />
                            {article.date}
                        </span>
                        <span>
                            <Clock size={16} />
                            {article.readTime} de lectura
                        </span>
                    </div>
                </header>

                <div
                    className={styles.content}
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                <footer className={styles.footer}>
                    <div className={styles.cta}>
                        <h3>¿Te fue útil este artículo?</h3>
                        <p>Poné en práctica estos consejos y potenciá tus ventas con Yeah! Tecnologías</p>
                        <Link href="/catalogo" className={styles.ctaButton}>
                            Ver Productos
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}
