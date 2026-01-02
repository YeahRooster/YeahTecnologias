import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Preferir nombres nuevos
    const user = process.env.SMTP_USER || process.env.EMAIL_USER || '';
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '';

    const isUsingNewNames = !!process.env.SMTP_USER;

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
        estado_variables: {
            usando_nombres_nuevos: isUsingNewNames,
            EMAIL_USER_existente: !!process.env.EMAIL_USER,
            SMTP_USER_existente: !!process.env.SMTP_USER,
        },
        diagnostico: {
            usuario_final_leido: user,
            longitud_password: pass.length,
            password_mascarada: maskPass(pass),
            tiene_espacios: pass.includes(' ')
        },
        resultado_smtp: smtpResult,
        debug_version: "1.0.4-SMTP-VARS",
        instrucciones: "Si 'usando_nombres_nuevos' es false, agrega SMTP_USER y SMTP_PASS en Vercel."
    });
}
