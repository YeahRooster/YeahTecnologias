import { NextResponse } from 'next/server';
import { createStockAlert } from '@/lib/googleSheets';

export async function POST(request: Request) {
    try {
        const { email, productName } = await request.json();

        if (!email || !productName) {
            return NextResponse.json(
                { error: 'Email y nombre de producto requeridos' },
                { status: 400 }
            );
        }

        const success = await createStockAlert(email, productName);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: 'No se pudo guardar la alerta. Verifica si existe la hoja "Alertas".' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error creando alerta:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
