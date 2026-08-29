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
        id: '6',
        slug: 'guia-modo-mostrador-revendedores',
        title: 'Guía paso a paso: Cómo usar el Modo Mostrador para vender con tu propia marca',
        excerpt: 'Descubrí cómo convertir nuestro catálogo en tu propia tienda online personalizada: configurá tu margen de ganancia, cargá tu logo y recibí pedidos directos a tu WhatsApp.',
        date: '28 Ago, 2026',
        category: 'Revendedores',
        tags: ['Revendedores', 'Modo Mostrador', 'Marca Blanca', 'Ventas', 'Tutorial'],
        imageUrl: '/blog/modo-mostrador-guia.jpg',
        content: `
            <p>¿Tenés un local de tecnología, vendés por redes sociales o te gustaría ofrecer productos a tus clientes sin invertir en crear una página web desde cero? El <strong>Modo Mostrador (Marca Blanca)</strong> de Yeah! Tecnologías está pensado especialmente para vos.</p>

            <p>Con esta herramienta podés usar todo nuestro catálogo frente a tus clientes o enviarles un link por WhatsApp con <strong>tus propios precios de venta, tu logo y tus datos de contacto</strong>, sin que nadie vea tus costos mayoristas.</p>

            <hr style="margin: 2rem 0; border: 0; border-top: 1px solid #e2e8f0;" />

            <h3>💼 ¿Qué ventajas te da el Modo Mostrador?</h3>
            <ul>
                <li><strong>Precios automáticos con tu ganancia:</strong> Elegís tu margen de recargo (+30%, +40%, +50%, +70% o personalizado) y todos los precios se recalculan en tiempo real.</li>
                <li><strong>Tu marca en primer plano:</strong> Podés cargar el nombre de tu local y subir tu propio logo para que reemplace cualquier información institucional.</li>
                <li><strong>Pedidos directos a tu WhatsApp:</strong> Tus clientes finales verán un botón verde <em>“📲 Pedir por WhatsApp a [Tu Local]”</em> para encargarte el producto directamente a tu teléfono.</li>
                <li><strong>Descarga de fotos limpias y textos para redes:</strong> Cada producto cuenta con un botón para descargar la foto en alta resolución sin marcas y copiar el texto listo para tus historias o estados.</li>
            </ul>

            <hr style="margin: 2rem 0; border: 0; border-top: 1px solid #e2e8f0;" />

            <h3>🚀 Paso a Paso: Cómo configurarlo en 2 minutos</h3>

            <h4>Paso 1: Iniciá sesión con tu cuenta mayorista</h4>
            <p>Ingresá con tu correo y contraseña en <a href="/login">Iniciar Sesión</a>. Si todavía no tenés cuenta de cliente habilitado, podés registrarte en la web y solicitar tu habilitación mayorista.</p>

            <h4>Paso 2: Activá el Modo Mostrador</h4>
            <p>Hacé clic en el botón <strong>💼 Modo Mostrador</strong> en la barra superior o ingresá a <a href="/cuenta">Mi Cuenta</a> y seleccioná la pestaña <strong>“Mi Local / Revendedor”</strong>.</p>

            <h4>Paso 3: Establecé tu porcentaje de ganancia</h4>
            <p>Elegí qué porcentaje querés sumarle al precio mayorista. Por ejemplo, si un producto cuesta $10.000 y elegís <strong>+40%</strong>, en la web se mostrará a <strong>$14.000</strong>.</p>

            <h4>Paso 4: Personalizá los datos de tu negocio</h4>
            <ul>
                <li><strong>Nombre del local:</strong> Escribí el nombre de tu negocio o tienda.</li>
                <li><strong>Logo:</strong> Subí una imagen con el logo de tu local desde tu computadora o celular.</li>
                <li><strong>Número de WhatsApp:</strong> Ingresá tu número con código de país (ej: <code>5493421234567</code>) para recibir los pedidos y consultas de tus clientes.</li>
            </ul>

            <h4>Paso 5: Compartí el enlace con tus clientes</h4>
            <p>Hacé clic en <strong>“📲 Copiar Link para Clientes”</strong>. Se generará automáticamente un enlace neutro que podés pegar en WhatsApp, Instagram o estados. Cuando tus clientes abran ese enlace:</p>
            <ol>
                <li>Verán el catálogo completo con tu logo y tus precios finales ya aumentados.</li>
                <li>No verán ninguna mención a precios mayoristas ni a Yeah! Tecnologías.</li>
                <li>Al elegir un producto, tocarán el botón para pedirte directamente a tu WhatsApp.</li>
            </ol>

            <hr style="margin: 2rem 0; border: 0; border-top: 1px solid #e2e8f0;" />

            <h3>💡 Consejos para vender más con tu catálogo digital</h3>
            <ul>
                <li><strong>Fijalo en tu biografía de Instagram:</strong> Pegá tu link de catálogo en el perfil de tus redes sociales para que tus seguidores consulten precios actualizados.</li>
                <li><strong>Aprovechá las fotos y copies:</strong> Usá el botón <em>“Copiar Texto para Redes”</em> en los productos más vendidos y publicalos en tus estados de WhatsApp junto con la foto descargada.</li>
                <li><strong>Atendé en tu mostrador con total tranquilidad:</strong> Si tenés un cliente físico en tu tienda, podés usar la web en una tablet o computadora para mostrarle modelos y stock en tiempo real.</li>
            </ul>

            <p style="background: #f0fdf4; padding: 1.25rem; border-radius: 8px; border-left: 4px solid #16a34a; margin-top: 2rem;">
                <strong>¿Tenés dudas o necesitás ayuda para configurarlo?</strong><br />
                Escribinos por WhatsApp a nuestro canal mayorista y nuestro equipo te asiste en lo que necesites para poner a punto tu catálogo de ventas.
            </p>
        `
    },
    {
        id: '5',
        slug: 'cables-carga-lenta-reclamos',
        title: 'Por qué algunos cables cargan lento (aunque sean nuevos) y cómo evitar reclamos',
        excerpt: 'No todos los cables son iguales. Aprende a identificar un cable de calidad y evita el reclamo más común en accesorios de celulares.',
        date: '12 Ene, 2026',
        category: 'Accesorios',
        tags: ['Cables', 'Carga', 'Consejos', 'Ventas'],
        imageUrl: '/blog/cables-carga-lenta.png',
        content: `
            <p>Uno de los reclamos más comunes en accesorios para celulares es: <strong>“El cable es nuevo, pero carga lento”.</strong></p>
            <p>La realidad es que no todos los cables son iguales, y muchos problemas se pueden evitar si se entiende qué mirar antes de vender o comprar.</p>

            <h3>🔌 No todos los cables cargan igual</h3>
            <p>Aunque por fuera se vean idénticos, por dentro pueden ser muy distintos. Los factores más importantes son:</p>
            <ul>
                <li><strong>Grosor interno del cable:</strong> Los cables más finos pierden energía. Cuanto más largo y más fino, peor rinde la carga.</li>
                <li><strong>Material interno:</strong> Un buen cable usa cobre de mejor calidad. Los más baratos suelen usar materiales que conducen peor la energía.</li>
                <li><strong>Carga vs carga + datos:</strong> Algunos cables están pensados solo para cargar, otros para cargar y transferir datos. Un cable de mala calidad puede fallar en ambas cosas.</li>
            </ul>

            <h3>⚡ Cables y carga rápida: el error más común</h3>
            <p>Muchos usuarios creen que la carga rápida depende solo del cargador, pero el cable es clave. Un cable que no soporta el amperaje necesario hace que la carga sea lenta, puede generar calor y hace que el celular no active la carga rápida real.</p>
            <p>Resultado: el cliente piensa que el problema es el cargador… o el producto.</p>

            <h3>🔥 El calor, el enemigo silencioso</h3>
            <p>Un cable de mala calidad suele calentarse más de lo normal, tener caídas de energía y degradarse rápido. El calor no solo daña el cable, también afecta la batería del celular, y ahí vienen los reclamos.</p>

            <h3>🛑 Cómo evitar reclamos como revendedor</h3>
            <p>Antes de vender, conviene preguntar qué celular usa el cliente, saber si necesita carga rápida y recomendar cables de largo razonable. Evitar cables demasiado finos o livianos: a veces vender el más barato termina saliendo caro.</p>

            <h3>✔️ Cómo identificar un cable confiable</h3>
            <p>Un buen cable suele tener buen grosor y peso, especificar el amperaje soportado y mantener una carga estable sin calentarse excesivamente. No hace falta que sea el más caro, pero sí que sea honesto en sus especificaciones.</p>

            <p><strong>Conclusión:</strong> Cuando se vende un cable adecuado, el cliente queda conforme, la batería se cuida más y se reduce el número de reclamos. Se construye confianza a largo plazo.</p>
            <p>¿Tenés dudas sobre qué cable te conviene vender o usar? Si querés evitar problemas o devoluciones, consultanos. Elegir bien un cable es más importante de lo que parece.</p>
        `
    },
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
