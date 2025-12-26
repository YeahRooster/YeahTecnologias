import { NextResponse } from 'next/server';
import { createOrder, findUserByEmail } from '@/lib/googleSheets';
import { sendOrderNotification } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { email, products, total } = await request.json();

        if (!email || !products || products.length === 0) {
            return NextResponse.json(
                { error: 'Datos incompletos' },
                { status: 400 }
            );
        }

        // Crear el pedido en Google Sheets
        const orderId = await createOrder({
            email,
            products,
            total,
        });

        // Obtener datos del cliente para el email
        const user = await findUserByEmail(email);

        if (user && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            // Enviar notificación por email
            try {
                await sendOrderNotification({
                    orderId,
                    customerEmail: email,
                    customerName: user.nombreCompleto || 'Cliente',
                    customerPhone: user.telefono || 'No especificado',
                    customerAddress: `${user.domicilio}, ${user.localidad}`,
                    customerLocal: user.nombreLocal || 'No especificado',
                    products,
                    total,
                    date: new Date().toLocaleDateString('es-AR'),
                });
                console.log('✅ Email de notificación enviado');
            } catch (emailError) {
                console.error('⚠️ No se pudo enviar el email, pero el pedido se registró:', emailError);
                // No fallar el pedido si el email falla
            }
        }

        return NextResponse.json({
            success: true,
            orderId,
        });

    } catch (error) {
        console.error('Error creando pedido:', error);
        return NextResponse.json(
            { error: 'Error al crear el pedido' },
            { status: 500 }
        );
    }
}
