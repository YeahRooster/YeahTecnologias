
import { NextResponse } from 'next/server';
import { getAllOrders, getProducts, findUserByEmail, Order, Product } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const orderId = resolvedParams.id;

        console.log(`🔍 [API] Buscando pedido ID: "${orderId}"`);

        // Cargar pedidos y productos en paralelo para eficiencia
        const [allOrders, allProducts] = await Promise.all([
            getAllOrders(),
            getProducts()
        ]);

        // Búsqueda flexible de pedido (ignorando case/trim)
        const order = allOrders.find(o =>
            String(o.idPedido).trim().toLowerCase() === String(orderId).trim().toLowerCase()
        );

        if (!order) {
            return NextResponse.json({ error: `Pedido no encontrado` }, { status: 404 });
        }

        // Reconstrucción inteligente de items con precios
        // El string viene como: "Producto A (x2); Producto B (x1)"
        const itemsRaw = order.productos.split(';').map(s => s.trim()).filter(Boolean);

        const itemsDetallados = itemsRaw.map(itemStr => {
            const match = itemStr.match(/(.+)\s\(x(\d+)\)/);
            if (match) {
                const nombre = match[1].trim();
                const cantidad = parseInt(match[2]);

                // Buscar producto en catálogo para obtener precio unitario actual
                // Nota: Usamos precio actual porque el histórico no se guardó en el string simple
                // Buscamos coincidencia exacta o parcial
                const productoCatalogo = allProducts.find(p => p.name === nombre) ||
                    allProducts.find(p => p.name.includes(nombre));

                const precioUnitario = productoCatalogo ? productoCatalogo.price : 0;

                return {
                    nombre,
                    cantidad,
                    precioUnitario,
                    total: precioUnitario * cantidad
                };
            }
            // Fallback si el formato no coincide
            return { nombre: itemStr, cantidad: 1, precioUnitario: 0, total: 0 };
        });

        // Obtener datos extra del usuario
        let userData = null;
        if (order.email) {
            const user = await findUserByEmail(order.email);
            if (user) {
                userData = {
                    nombre: user.nombreCompleto,
                    local: user.nombreLocal,
                    direccion: user.domicilio,
                    localidad: user.localidad,
                    telefono: user.telefono,
                    cuit: user.cuitCuil
                };
            }
        }

        return NextResponse.json({
            order,
            items: itemsDetallados, // Enviamos items enriquecidos
            customer: userData
        });

    } catch (error) {
        console.error('Error obteniendo pedido:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
