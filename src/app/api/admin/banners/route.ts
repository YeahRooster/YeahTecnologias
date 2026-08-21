import { NextResponse } from 'next/server';
import { getAllBanners, createBanner, updateBanner, deleteBanner, reorderBanners } from '@/lib/googleSheets';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const banners = await getAllBanners();
    return NextResponse.json({ banners });
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, banner } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const newId = await createBanner(banner);
    return NextResponse.json({ success: true, id: newId });
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { password, id, updates, idList } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Modo reordenamiento: se envía un array de IDs en el nuevo orden
    if (idList && Array.isArray(idList)) {
      const success = await reorderBanners(idList);
      return NextResponse.json({ success });
    }

    // Modo edición individual
    if (!id) {
      return NextResponse.json({ error: 'Falta el ID del banner' }, { status: 400 });
    }

    const success = await updateBanner(id, updates);
    if (!success) {
      return NextResponse.json({ error: 'Banner no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { password, id } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const success = await deleteBanner(id);
    if (!success) {
      return NextResponse.json({ error: 'Banner no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
