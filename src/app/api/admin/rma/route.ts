import { NextResponse } from 'next/server';
import { getAllRmas, updateRmaStatus } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

// GET: Obtener todos los RMAs (solo admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const rmas = await getAllRmas();
    return NextResponse.json({ rmas });
  } catch (error) {
    console.error('Error obteniendo RMAs (admin):', error);
    return NextResponse.json({ error: 'Error al obtener RMAs' }, { status: 500 });
  }
}

// PUT: Actualizar estado de un RMA (solo admin)
export async function PUT(request: Request) {
  try {
    const { rmaId, status, password } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const validStatuses = ['Pendiente', 'En Revisión', 'Cambiado', 'Devuelto'];
    if (!rmaId || !status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const success = await updateRmaStatus(rmaId, status);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'RMA no encontrado' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error actualizando RMA:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
