import { NextResponse } from 'next/server';
import { getMinPurchaseAmount } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const minPurchaseAmount = await getMinPurchaseAmount();
        return NextResponse.json({
            minPurchaseAmount,
        });
    } catch (error) {
        console.error('Error in /api/config:', error);
        return NextResponse.json({
            minPurchaseAmount: 25000,
        });
    }
}
