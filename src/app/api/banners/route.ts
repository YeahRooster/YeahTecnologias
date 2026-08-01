import { NextResponse } from 'next/server';
import { getAllBanners } from '@/lib/googleSheets';

export async function GET() {
  try {
    const banners = await getAllBanners();
    // Solo devolver los activos al cliente público
    const activeBanners = banners.filter(b => b.activo);
    return NextResponse.json(activeBanners);
  } catch (error: any) {
    console.error('Error fetching public banners:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
