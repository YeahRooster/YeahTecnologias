import HeroCarousel from "@/components/HeroCarousel";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.home}>
      {/* Slider Dinámico de Banners */}
      <HeroCarousel />

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
