import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Buscamos todas las variables que empiecen con EMAIL o SMTP para ver qué nombres "existen"
    const allEnvKeys = Object.keys(process.env);
    const emailRelatedKeys = allEnvKeys.filter(key => key.includes('EMAIL') || key.includes('SMTP'));

    const user = process.env.SMTP_USER || process.env.EMAIL_USER || '';
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '';

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
        debug_version: "1.0.5-ENV-DETECTIVE",
        variables_detectadas_en_vercel: emailRelatedKeys,
        configuracion_actual: {
            usando_smtp_user: !!process.env.SMTP_USER,
            usando_email_user: !!process.env.EMAIL_USER,
            usuario_final: user,
            longitud_pass: pass.length,
            pass_mascara: maskPass(pass)
        },
        resultado_smtp: smtpResult,
        sugerencia: emailRelatedKeys.length === 0 ? "Vercel no está inyectando NINGUNA variable. Revisa el entorno." : "Mira los nombres arriba para ver si hay errores de escritura."
    });
}
