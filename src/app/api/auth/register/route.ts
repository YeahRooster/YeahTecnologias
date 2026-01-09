import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/googleSheets';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const userData = await request.json();

        // Validar campos requeridos
        const requiredFields = ['email', 'password', 'nombreCompleto', 'domicilio', 'telefono', 'cuitCuil', 'nombreLocal', 'localidad'];
        for (const field of requiredFields) {
            if (!userData[field]) {
                return NextResponse.json(
                    { error: `El campo ${field} es requerido` },
                    { status: 400 }
                );
            }
        }

        const user = await registerUser(userData);

        // Enviar email de bienvenida (sin bloquear la respuesta)
        sendWelcomeEmail(user.email, user.nombreCompleto).catch(err =>
            console.error('Error enviando mail de bienvenida asíncrono:', err)
        );

        // No devolvemos la contraseña
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            user: userWithoutPassword,
        });

    } catch (error: any) {
        console.error('Error en registro:', error);

        if (error.message === 'El email ya está registrado') {
            return NextResponse.json(
                { error: error.message },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Error al registrar usuario' },
            { status: 500 }
        );
    }
}
