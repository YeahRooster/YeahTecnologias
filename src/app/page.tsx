import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.home}>
      {/* Hero Section con Banner */}
      <section className={styles.hero}>
        <img src="/banner.jpg" alt="Yeah! Tecnologías - No es solo tecnología... Es Yeah!" className={styles.heroBanner} />
        <div className={styles.heroOverlay}>
          <div className="container">
            <div className={styles.heroContent}>
              <h1>Tu Negocio Merece la Mejor Tecnología</h1>
              <p>Accedé a precios mayoristas exclusivos. Stock actualizado en tiempo real y envíos a todo el país.</p>
              <div className={styles.heroButtons}>
                <Link href="/catalogo" className="btn btn-primary">
                  Ver Catálogo <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                </Link>
                <a
                  href="https://wa.me/5493425924747?text=Hola!%20Vengo%20de%20la%20web%20y%20quiero%20consultar%20con%20ventas."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  Contactar Ventas
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías Destacadas */}
      <section className="container" style={{ padding: '4rem 1rem' }}>
        <h2 className="section-title">Categorías Populares</h2>
        <div className={styles.categoriesGrid}>
          {['Hardware', 'Almacenamiento', 'Audio', 'Accesorios'].map((cat) => (
            <Link key={cat} href={`/catalogo?categoria=${cat}`} className={styles.categoryCard}>
              <h3>{cat}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2>¿Listo para hacer tu pedido?</h2>
          <p>Explorá nuestro catálogo y aprovechá nuestras ofertas. ¡Contactate para asesoramiento personalizado!</p>
          <Link href="/catalogo" className="btn btn-primary">
            Ir al Catálogo
          </Link>
        </div>
      </section>
    </div>
  );
}
