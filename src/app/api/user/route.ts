import { NextResponse } from 'next/server';
import { findUserByEmail, updateUser, getUserOrders } from '@/lib/googleSheets';

// Obtener datos del usuario y sus pedidos
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email es requerido' },
                { status: 400 }
            );
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        const orders = await getUserOrders(email);

        // No devolvemos la contraseña
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            user: userWithoutPassword,
            orders,
        });

    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        return NextResponse.json(
            { error: 'Error al obtener datos del usuario' },
            { status: 500 }
        );
    }
}

// Actualizar datos del usuario
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { email, ...updates } = body;

        console.log('📝 API /user PUT - Email:', email);
        console.log('📝 API /user PUT - Updates:', updates);

        if (!email) {
            return NextResponse.json(
                { error: 'Email es requerido' },
                { status: 400 }
            );
        }

        const success = await updateUser(email, updates);

        console.log('📝 API /user PUT - Success:', success);

        if (!success) {
            return NextResponse.json(
                { error: 'No se pudo actualizar el usuario. Verificá que el email exista en la hoja de Usuarios.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Usuario actualizado correctamente' });

    } catch (error: any) {
        console.error('❌ Error actualizando usuario:', error);
        return NextResponse.json(
            { error: `Error al actualizar usuario: ${error.message}` },
            { status: 500 }
        );
    }
}
