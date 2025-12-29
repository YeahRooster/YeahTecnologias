import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // 1. Verificar variables de entorno
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD; // Ojo, no mostrar esto completo en logs

    if (!user || !pass) {
        return NextResponse.json({
            error: 'Faltan variables de entorno',
            details: { hasUser: !!user, hasPass: !!pass }
        }, { status: 500 });
    }

    try {
        // 2. Crear transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass,
            },
        });

        // 3. Verificar conexión
        await transporter.verify();
        console.log('✅ Conexión SMTP exitosa');

        // 4. Intentar enviar email
        const info = await transporter.sendMail({
            from: `"Test Yeah!" <${user}>`,
            to: user, // Se envía a sí mismo
            subject: "Prueba de Configuración de Email 📧",
            text: "Si lees esto, el sistema de correos funciona correctamente.",
            html: "<b>Si lees esto, el sistema de correos funciona correctamente.</b>",
        });

        return NextResponse.json({
            success: true,
            message: 'Email enviado correctamente',
            messageId: info.messageId,
            destination: user
        });

    } catch (error: any) {
        console.error('❌ Error enviando email de prueba:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            command: error.command
        }, { status: 500 });
    }
}
