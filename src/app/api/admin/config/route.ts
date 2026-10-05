import { NextResponse } from 'next/server';
import { getMinPurchaseAmount, setMinPurchaseAmount } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const minPurchaseAmount = await getMinPurchaseAmount();
        return NextResponse.json({
            minPurchaseAmount,
        });
    } catch (error: any) {
        console.error('Error fetching admin config:', error);
        return NextResponse.json(
            { error: error.message || 'Error al obtener la configuración' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { minPurchaseAmount } = body;

        if (minPurchaseAmount === undefined || isNaN(Number(minPurchaseAmount)) || Number(minPurchaseAmount) < 0) {
            return NextResponse.json(
                { error: 'El monto mínimo de compra debe ser un número válido mayor o igual a 0' },
                { status: 400 }
            );
        }

        const numAmount = Number(minPurchaseAmount);
        await setMinPurchaseAmount(numAmount);

        return NextResponse.json({
            success: true,
            minPurchaseAmount: numAmount,
            message: 'Monto mínimo de compra actualizado correctamente',
        });
    } catch (error: any) {
        console.error('Error updating admin config:', error);
        return NextResponse.json(
            { error: error.message || 'Error al guardar la configuración' },
            { status: 500 }
        );
    }
}
