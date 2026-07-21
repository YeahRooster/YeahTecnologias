import { NextResponse } from 'next/server';
import { createRma, getRmaByEmail } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

// GET: Obtener RMAs del cliente
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const rmas = await getRmaByEmail(email);
    return NextResponse.json({ rmas });
  } catch (error) {
    console.error('Error obteniendo RMAs:', error);
    return NextResponse.json({ error: 'Error al obtener RMAs' }, { status: 500 });
  }
}

// POST: Crear nuevo RMA
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, producto, nroSerie, falla, fechaCompra, observaciones } = body;

    if (!email || !producto || !falla) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios: email, producto y descripción de falla' },
        { status: 400 }
      );
    }

    const idRma = await createRma({ email, producto, nroSerie, falla, fechaCompra, observaciones });

    return NextResponse.json({ success: true, idRma });
  } catch (error) {
    console.error('Error creando RMA:', error);
    return NextResponse.json({ error: 'Error al crear el RMA' }, { status: 500 });
  }
}
