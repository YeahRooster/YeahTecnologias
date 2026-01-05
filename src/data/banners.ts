export interface Banner {
    id: string;
    desktopImage: string;
    mobileImage?: string; // Opcional, si quisieras una versión vertical
    title: string;
    description: string;
    link: string;
    buttonText: string;
    isActive: boolean;
    style?: 'dark' | 'light'; // Para el color del texto sobre la imagen
}

export const banners: Banner[] = [
    {
        id: '3',
        desktopImage: '/banners/peripherals.png',
        title: 'PERIFÉRICOS & AUDIO',
        description: 'Equipá tu negocio con las mejores marcas en teclados, mouse y sonido.',
        // Corrección: Usamos filtro de categoría
        link: '/catalogo?categoria=Perifericos',
        buttonText: 'Ver Productos',
        isActive: true,
        style: 'light'
    },
    {
        id: '2',
        desktopImage: '/banners/social_media.png',
        title: 'SEGUINOS EN REDES',
        description: 'Enterate antes que nadie de los nuevos ingresos y sorteos.',
        link: 'https://www.instagram.com/yeahtecnologias/',
        buttonText: 'Ir a Instagram',
        isActive: true,
        style: 'light'
    },
    {
        id: '1',
        desktopImage: '/banners/offers_sale.png',
        title: '¡OFERTAS DEL MES!',
        description: 'Aprovecha precios de liquidación en accesorios seleccionados.',
        link: '/catalogo?ofertas=true',
        buttonText: 'Ver Ofertas',
        isActive: false, // Desactivado
        style: 'light'
    }
];
