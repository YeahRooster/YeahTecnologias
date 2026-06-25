import { NextResponse } from 'next/server';
import { sendCampaignEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { emails, subject, message, password } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0 || !subject || !message) {
      return NextResponse.json({ error: 'Datos incompletos o inválidos' }, { status: 400 });
    }

    const result = await sendCampaignEmail(emails, subject, message);
    return NextResponse.json({ success: true, ...result });

  } catch (error) {
    console.error('Error procesando campaña de email:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
