import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/googleSheets';

export async function GET() {
    try {
        const products = await getProducts();
        return NextResponse.json(products);
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        return NextResponse.json(
            { error: 'Error al obtener productos' },
            { status: 500 }
        );
    }
}
