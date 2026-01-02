import { NextResponse } from 'next/server';
import { getAllUsers, toggleUserStatus } from '@/lib/googleSheets';

// Obtener todos los usuarios
export async function GET() {
    try {
        const users = await getAllUsers();
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
    }
}

// Habilitar/Deshabilitar usuario
export async function PUT(request: Request) {
    try {
        const { email, habilitado } = await request.json();
        const success = await toggleUserStatus(email, habilitado);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
    }
}
