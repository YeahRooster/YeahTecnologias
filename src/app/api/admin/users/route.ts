import { NextResponse } from 'next/server';
import { getAllUsers, toggleUserStatus, findUserByEmail } from '@/lib/googleSheets';
import { sendActivationEmail } from '@/lib/email';

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
            // Si se habilitó, enviar mail de notificación
            if (habilitado) {
                try {
                    const user = await findUserByEmail(email);
                    if (user) {
                        await sendActivationEmail(email, user.nombreCompleto);
                    }
                } catch (emailError) {
                    console.error('Error enviando mail de activación:', emailError);
                }
            }
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
    }
}
