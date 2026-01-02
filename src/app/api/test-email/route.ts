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
        debug_version: "1.0.8-VAR-CHECK",
        analisis_variables: {
            SMTP_PASS_longitud: (process.env.SMTP_PASS || '').length,
            EMAIL_PASSWORD_longitud: (process.env.EMAIL_PASSWORD || '').length,

            // ¿Cuál está ganando?
            ganadora: process.env.SMTP_PASS ? "SMTP_PASS" : (process.env.EMAIL_PASSWORD ? "EMAIL_PASSWORD" : "NINGUNA")
        },
        resultado_smtp: smtpResult,
        nota: "Una App Password de Google DEBE tener 16 caracteres. Si alguna de arriba dice 10, esa es la que está arruinando la conexión."
    });
}
