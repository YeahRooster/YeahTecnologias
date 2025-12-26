import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/googleSheets';

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
