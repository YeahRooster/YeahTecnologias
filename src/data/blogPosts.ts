export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string; // HTML string for simplicity
    date: string;
    // author removido
    category: string;
    tags: string[];
    imageUrl: string;
}

export const blogPosts: BlogPost[] = [
    {
        id: '4',
        slug: 'cargadores-rapidos-bateria',
        title: 'Cargadores rápidos y batería del celular: lo que de verdad importa',
        excerpt: 'No todo es marketing. Aprende a identificar un buen cargador, qué es el amperaje y cómo cuidar la vida útil de tu batería sin mitos.',
        date: '03 Ene, 2026',
        category: 'Tecnología',
        tags: ['Cargadores', 'Batería', 'Guía', 'Mitos'],
        imageUrl: '/blog/charger-battery.png',
        content: `
            <p>Hoy casi todos los celulares prometen “carga rápida”, “turbo” o “fast charge”. El problema es que no siempre está claro qué es real, qué es marketing y qué conviene usar para no arruinar la batería con el tiempo.</p>
            <p>En esta nota te explicamos, sin vueltas, cómo elegir un buen cargador, qué mirar en las especificaciones y cómo cuidar la batería de tu celular en el uso diario.</p>

            <h3>🔌 Voltaje y Amperaje: ¿A qué prestar atención?</h3>
            <p>Este es uno de los puntos donde más confusión hay. Para simplificarlo:</p>
            <ul>
                <li><strong>Voltaje (V):</strong> Es la “presión” de la energía. Los celulares modernos regulan esto automáticamente (5V, 9V, 12V), así que no suele ser el problema principal.</li>
                <li><strong>Amperaje (A):</strong> Es la <strong>cantidad</strong> de energía que entrega el cargador. Aquí está la clave.</li>
            </ul>
            <p>El celular solo "toma" la corriente que necesita, pero si el cargador no puede entregarla de forma estable, aparecen la carga lenta, el sobrecalentamiento y el desgaste prematuro.</p>
            <blockquote>"El amperaje estable importa mucho más que una caja llena de Watts y promesas de marketing."</blockquote>

            <h3>⚡ ¿Qué es realmente la carga rápida?</h3>
            <p>La carga rápida no es magia, es un ecosistema que depende de tres pilares:</p>
            <ol>
                <li>El celular (que soporte la tecnología).</li>
                <li>El cargador (que tenga la potencia necesaria).</li>
                <li>El cable (que sea de calidad para transportar esa energía).</li>
            </ol>
            <p>Si uno falla, no hay carga rápida. Además, recuerda que la velocidad máxima suele funcionar solo hasta el 50-60% de la carga; después el sistema baja la velocidad para proteger la batería, ¡y eso es bueno!</p>

            <h3>🔋 ¿La carga rápida daña la batería?</h3>
            <p><strong>Respuesta honesta: No.</strong> Si es una carga rápida real y bien certificada, no daña tu equipo.</p>
            <p>Lo que SÍ daña la batería es:</p>
            <ul>
                <li>Calor excesivo (el enemigo número 1).</li>
                <li>Cargadores genéricos de mala calidad que no filtran picos de tensión.</li>
                <li>Usar el celular para jugar juegos pesados mientras está enchufado (sobrecalentamiento doble).</li>
            </ul>

            <h3>⚠️ Cargadores genéricos: Cuándo sí y cuándo no</h3>
            <p>No todos los genéricos son malos, pero hay señales de alerta:</p>
            <ul>
                <li>🔴 <strong>Huye si:</strong> No pesa nada (literalmente), promete "100W" sin marca ni certificación, o calienta excesivamente al usarlo.</li>
                <li>🟢 <strong>Es bueno si:</strong> Tiene especificaciones claras de Voltaje y Amperaje, se siente sólido al tacto y mantiene una carga estable sin hervir.</li>
            </ul>

            <h3>📱 Consejos de oro para el día a día</h3>
            <p>Pequeños hábitos que alargan la vida de tu equipo años:</p>
            <ul>
                <li>Evita dejar el celular al 100% enchufado durante demasiadas horas innecesariamente.</li>
                <li>Nunca lo cargues bajo el sol o en lugares muy calurosos.</li>
                <li>Usa cables en buen estado; un cable pelado o dañado es un riesgo innecesario.</li>
            </ul>

            <p><strong>Conclusión:</strong> No necesitas comprar siempre el cargador más caro, pero sí uno que cumpla lo que promete. En <strong>Yeah! Tecnologías</strong> te asesoramos según tu equipo para que no gastes de más ni pongas en riesgo tu batería. ¿Dudas? ¡Escribinos!</p>
        `
    },
    {
        id: '1',
        slug: 'guia-auriculares-gamer',
        title: 'Guía definitiva: Cómo elegir tus auriculares gamer',
        excerpt: 'No todos los auriculares son iguales. Descubre qué buscar en cuanto a sonido, comodidad y micrófono según tu presupuesto.',
        date: '02 Ene, 2026',
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
        date: '28 Dic, 2025',
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
        date: '26 Dic, 2025',
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
