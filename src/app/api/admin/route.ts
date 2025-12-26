import { NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/googleSheets';
// import { updateOrderStatus } from '@/lib/googleSheets'; // COMENTADO TEMPORALMENTE
import { sendOrderStatusUpdate } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const adminPassword = searchParams.get('password');

        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: 'Acceso denegado' },
                { status: 403 }
            );
        }

        const orders = await getAllOrders();

        return NextResponse.json({ orders });

    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        return NextResponse.json(
            { error: 'Error al obtener pedidos' },
            { status: 500 }
        );
    }
}

/* METODO PUT COMENTADO TEMPORALMENTE PARA DEPLOYMENT
export async function PUT(request: Request) {
    try {
        const { orderId, status, password } = await request.json();

        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        if (!orderId || !status) {
            return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
        }

        // Actualizar en Google Sheets
        const result = await updateOrderStatus(orderId, status);

        if (result.success) {
            console.log(`✅ [ADMIN API] Estado actualizado a: ${status}`);

            // Enviar email de notificación si aplica
            if (['Preparado', 'Entregado', 'Cancelado'].includes(status)) {
                console.log(`📧 [ADMIN API] Intentando enviar email a: ${result.email}`);

                if (result.email) {
                    try {
                        const emailSent = await sendOrderStatusUpdate(
                            result.email,
                            result.customerName || 'Cliente',
                            orderId,
                            status as any
                        );
                        console.log(`📧 [ADMIN API] Resultado envío email: ${emailSent ? 'EXITO' : 'FALLO'}`);
                    } catch (emailError) {
                        console.error('📧 [ADMIN API] Error crítico enviando email:', emailError);
                    }
                } else {
                    console.warn('⚠️ [ADMIN API] No se encontró email para enviar notificación');
                }
            } else {
                console.log('ℹ️ [ADMIN API] No se requiere email para este estado');
            }
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'No se encontró el pedido' }, { status: 404 });
        }

    } catch (error) {
        console.error('Error actualizando pedido:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
*/
