import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET() {
    // VALOR FIJO PARA LA PRUEBA FINAL
    const user = 'yeah.tecnologias@gmail.com';
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '';

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
        debug_version: "1.0.7-HARDCODED-USER",
        resultado_esperado: {
            usuario_hardcodeado: user,
            password_leida_de_vercel: pass ? "SI (longitud " + pass.length + ")" : "NO"
        },
        resultado_smtp: smtpResult,
        nota: "Si aquí sigue fallando con BadCredentials, la contraseña de 16 caracteres en Vercel está mal escrita o tiene espacios."
    });
}
