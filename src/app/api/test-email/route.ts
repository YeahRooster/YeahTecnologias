import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const allEnvKeys = Object.keys(process.env);

    // Filtramos para ver qué variables relacionadas con Vercel existen
    const vercelVars = allEnvKeys.filter(key => key.includes('VERCEL'));
    const emailVars = allEnvKeys.filter(key => key.includes('EMAIL') || key.includes('SMTP'));

    return NextResponse.json({
        debug_version: "1.0.6-IDENTITY-TEST",
        identidad_servidor: {
            url_despliegue: process.env.VERCEL_URL || "No disponible",
            entorno: process.env.VERCEL_ENV || "No disponible",
            proyecto_id: process.env.VERCEL_PROJECT_ID ? "PRESENT-ID-OK" : "MISSING",
            region: process.env.VERCEL_REGION || "No disponible"
        },
        variables_visibles: {
            totales: allEnvKeys.length,
            relacionadas_con_email: emailVars,
            relacionadas_con_vercel: vercelVars
        },
        configuracion_actual: {
            usando_smtp_user: !!process.env.SMTP_USER,
            usando_email_user: !!process.env.EMAIL_USER,
            usuario_final: process.env.SMTP_USER || process.env.EMAIL_USER || "VACÍO"
        }
    });
}
