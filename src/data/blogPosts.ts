export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string; // HTML string for simplicity
    date: string;
    author: string;
    category: string;
    tags: string[];
    imageUrl: string;
}

export const blogPosts: BlogPost[] = [
    {
        id: '1',
        slug: 'guia-auriculares-gamer',
        title: 'Guía definitiva: Cómo elegir tus auriculares gamer',
        excerpt: 'No todos los auriculares son iguales. Descubre qué buscar en cuanto a sonido, comodidad y micrófono según tu presupuesto.',
        date: '27 Dic, 2025',
        author: 'Equipo Yeah!',
        category: 'Audio',
        tags: ['Gamer', 'Auriculares', 'Guía', 'Audio'],
        imageUrl: '/blog/headphones.png', // Imagen generada IA
        content: `
            <p>Elegir los auriculares perfectos puede marcar la diferencia entre escuchar los pasos de tu enemigo a tiempo o perder la partida. En Yeah! Tecnologías probamos cientos de modelos y aquí te traemos las claves.</p>
            
            <h3>1. Comodidad: La reina olvidada</h3>
            <p>Puedes tener el mejor sonido del mundo, pero si te duelen las orejas a los 30 minutos, no sirven. Busca almohadillas de <strong>memory foam</strong> y diademas ajustables con suspensión.</p>

            <h3>2. ¿Sonido Surround 7.1 o Estéreo?</h3>
            <p>Para juegos competitivos (Shooters), el estéreo de alta calidad suele ser mejor para posicionar enemigos. El 7.1 virtual es genial para inmersión en juegos de aventura, pero a veces "ensucia" el sonido competitivo.</p>

            <h3>3. El Micrófono</h3>
            <p>Si juegas con amigos, la comunicación es clave. Busca micrófonos con cancelación de ruido pasiva para que no se escuche tu teclado mecánico de fondo.</p>

            <blockquote>"Invertir en buenos periféricos es invertir en tu experiencia de juego."</blockquote>

            <p>No dudes en consultar por nuestro stock disponible o pedirnos recomendaciones; estamos aquí para asesorarte y ayudarte a encontrar la opción que mejor se ajuste a tu estilo de juego.</p>
        `
    },
    {
        id: '2',
        slug: 'mantenimiento-pc-lenta',
        title: '5 Errores que hacen que tu PC vaya lenta',
        excerpt: '¿Tu computadora ya no vuela como antes? Antes de comprar una nueva, revisa estos puntos críticos de mantenimiento.',
        date: '20 Dic, 2025',
        author: 'Soporte Técnico',
        category: 'PC & Hardware',
        tags: ['Mantenimiento', 'PC', 'Tips', 'Hardware'],
        imageUrl: '/blog/pc-cleaning.png', // Imagen generada IA
        content: `
            <p>Es la historia de siempre: compras una PC nueva, vuela, y al año parece una tortuga. No siempre es culpa del hardware, a veces es falta de cariño.</p>

            <h3>1. El polvo es el enemigo silencioso</h3>
            <p>El polvo obstruye los ventiladores. Menos aire = más calor. Más calor = el procesador baja su velocidad para no quemarse (Thermal Throttling). Limpia tu PC cada 6 meses.</p>

            <h3>2. Demasiados programas al inicio</h3>
            <p>Abre el Administrador de Tareas y ve a la pestaña "Inicio". Deshabilita todo lo que no necesites que arranque con Windows (Spotify, Steam, etc).</p>

            <h3>3. Discos llenos</h3>
            <p>Los discos SSD pierden rendimiento si están llenos al tope. Intenta dejar siempre al menos un 15-20% de espacio libre.</p>

            <p><strong>Consejo final:</strong> Un mantenimiento preventivo regular es clave. Mantener tu equipo limpio y ordenado extenderá su vida útil y asegurará que rinda siempre al máximo en tus partidas.</p>
        `
    },
    {
        id: '3',
        slug: 'smartwatch-vs-smartband',
        title: 'Smartwatch vs Smartband: ¿Cuál necesitas?',
        excerpt: 'Analizamos las diferencias clave entre estos dos wearables para ayudarte a decidir cuál se adapta mejor a tu estilo de vida.',
        date: '15 Dic, 2025',
        author: 'Editorial Tech',
        category: 'Wearables',
        tags: ['Smartwatch', 'Comparativa', 'Gadgets'],
        imageUrl: '/blog/smartwatch.png', // Imagen generada IA
        content: `
            <p>Ambos te dan la hora y miden tus pasos, pero ahí terminan las similitudes. ¿Vale la pena pagar la diferencia por un Smartwatch?</p>

            <h3>La Smartband: Ligera y Autonóma</h3>
            <p>Si solo quieres medir tu sueño, pasos y ver notificaciones básicas sin cargar la batería cada día, la Smartband es para ti. Son económicas, ligeras y la batería dura semanas.</p>

            <h3>El Smartwatch: Tu teléfono en la muñeca</h3>
            <p>Si quieres contestar llamadas, responder WhatsApps, usar mapas y tener apps completas, necesitas un Smartwatch. La desventaja: la batería suele durar 1 o 2 días en modelos potentes.</p>

            <h3>Veredicto</h3>
            <ul>
                <li><strong>Deportista casual / Minimalista:</strong> Smartband.</li>
                <li><strong>Usuario intensivo / Oficina:</strong> Smartwatch.</li>
            </ul>
        `
    }
];

export const getAllPosts = () => blogPosts;

export const getPostBySlug = (slug: string) => {
    return blogPosts.find(post => post.slug === slug);
};

export const getRelatedPosts = (currentSlug: string, category: string) => {
    return blogPosts
        .filter(post => post.category === category && post.slug !== currentSlug)
        .slice(0, 3);
};

export const getAllCategories = () => {
    const categories = blogPosts.map(post => post.category);
    return ['Todas', ...Array.from(new Set(categories))];
};
