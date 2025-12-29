import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const user = process.env.EMAIL_USER || '';
    const pass = process.env.EMAIL_PASSWORD || '';

    // MÁSCARA DE SEGURIDAD
    const maskPass = (p: string) => {
        if (!p) return 'VACÍA';
        if (p.length < 4) return 'MUY CORTA';
        return p.substring(0, 2) + '*'.repeat(p.length - 4) + p.substring(p.length - 2);
    };

    let smtpResult = "";
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
        });
        await transporter.verify();
        smtpResult = "CONEXION EXITOSA ✅";
    } catch (e: any) {
        smtpResult = "FALLO ❌: " + e.message;
    }

    return NextResponse.json({
        diagnostico: {
            usuario_leido: user,
            longitud_password: pass.length,
            password_mascarada: maskPass(pass),
            tiene_espacios: pass.includes(' ')
        },
        resultado_smtp: smtpResult
    });
}
