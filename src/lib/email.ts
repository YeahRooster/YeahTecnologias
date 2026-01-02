// Versión: 1.0.8 - HARDCODED PASS TEST
import nodemailer from 'nodemailer';

const createTransporter = () => {
  // 1. MAIL CORRECTO
  const user = 'yeah.tecnologias@gmail.com';

  // 2. CONTRASEÑA CORRECTA (HARDCODED) -> ¡PEGALA AQUI ABAJO!
  // Reemplaza 'PEGAR_AQUI_LA_CLAVE_DE_16_LETRAS' por tu clave real
  const pass = 'tbgzzllcvbwmwnaz';

  console.log('[DEBUG-EMAIL] Usando credenciales directas:', { user, passLength: pass.length });

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass,
    },
  });
};

const transporter = createTransporter();

interface OrderEmailData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLocal: string;
  products: { name: string; quantity: number; price: number }[];
  total: number;
  date: string;
}

export async function sendOrderNotification(orderData: OrderEmailData) {
  const productsHtml = orderData.products
    .map(
      (p) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${p.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${p.price.toLocaleString('es-AR')}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(p.price * p.quantity).toLocaleString('es-AR')}</td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0a0a1a 0%, #5c5ca8 100%); color: white; padding: 20px; text-align: center; }
        .content { background: #f8f9fa; padding: 20px; }
        .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .label { font-weight: bold; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; background: white; }
        th { background: #5c5ca8; color: white; padding: 10px; text-align: left; }
        .total { font-size: 1.3em; font-weight: bold; color: #ff5722; text-align: right; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Nuevo Pedido Recibido</h1>
          <p>Yeah! Tecnologías</p>
        </div>
        
        <div class="content">
          <div class="info-box">
            <h2 style="margin-top: 0; color: #0a0a1a;">Información del Pedido</h2>
            <div class="info-row">
              <span class="label">Número de Pedido:</span>
              <span>${orderData.orderId}</span>
            </div>
            <div class="info-row">
              <span class="label">Fecha:</span>
              <span>${orderData.date}</span>
            </div>
          </div>

          <div class="info-box">
            <h2 style="margin-top: 0; color: #0a0a1a;">Datos del Cliente</h2>
            <div class="info-row">
              <span class="label">Nombre:</span>
              <span>${orderData.customerName}</span>
            </div>
            <div class="info-row">
              <span class="label">Local:</span>
              <span>${orderData.customerLocal}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span>${orderData.customerEmail}</span>
            </div>
            <div class="info-row">
              <span class="label">Teléfono:</span>
              <span>${orderData.customerPhone}</span>
            </div>
            <div class="info-row">
              <span class="label">Dirección:</span>
              <span>${orderData.customerAddress}</span>
            </div>
          </div>

          <div class="info-box">
            <h2 style="margin-top: 0; color: #0a0a1a;">Productos</h2>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align: center;">Cantidad</th>
                  <th style="text-align: right;">Precio Unit.</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${productsHtml}
              </tbody>
            </table>
            <div class="total">
              TOTAL: $${orderData.total.toLocaleString('es-AR')}
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Usamos el mismo user 'yeah.tecnologias@gmail.com' para el FROM
  const fromUser = 'yeah.tecnologias@gmail.com';

  const mailOptions = {
    from: `"Yeah! Tecnologías" <${fromUser}>`,
    to: orderData.customerEmail,
    // BCC al mismo mail de envío para tener copia
    bcc: fromUser,
    subject: `🛒 Nuevo Pedido #${orderData.orderId} - ${orderData.customerName}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de notificación enviado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return false;
  }
}

export async function sendOrderStatusUpdate(
  email: string,
  customerName: string,
  orderId: string,
  status: 'Preparado' | 'Entregado' | 'Cancelado'
) {
  let subject = '';
  let messageTitle = '';
  let messageBody = '';
  let color = '';

  switch (status) {
    case 'Preparado':
      subject = `📦 Tu pedido #${orderId} está listo!`;
      messageTitle = '¡Tu pedido está preparado!';
      messageBody = 'Tu pedido ya fue armado y está listo para ser retirado o enviado. Te avisaremos cualquier novedad.';
      color = '#2563eb'; // Azul
      break;
    case 'Entregado':
      subject = `✅ Pedido #${orderId} Entregado`;
      messageTitle = '¡Gracias por tu compra!';
      messageBody = 'Tu pedido figura como entregado. ¡Esperamos que lo disfrutes! Gracias por confiar en Yeah! Tecnologías.';
      color = '#059669'; // Verde
      break;
    case 'Cancelado':
      subject = `❌ Pedido #${orderId} Cancelado`;
      messageTitle = 'Pedido Cancelado';
      messageBody = 'Tu pedido ha sido cancelado. Si crees que esto es un error, por favor contactanos.';
      color = '#dc2626'; // Rojo
      break;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
        .header { background-color: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
        .btn { display: inline-block; padding: 10px 20px; background-color: ${color}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${messageTitle}</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${customerName}</strong>,</p>
          <p>${messageBody}</p>
          <p>Nro de Pedido: <strong>${orderId}</strong></p>
          <br>
          <p>Si tenés consultas, respondé a este correo.</p>
          <p><em>Yeah! Tecnologías</em></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const fromUser = 'yeah.tecnologias@gmail.com';

  const mailOptions = {
    from: `"Yeah! Tecnologías" <${fromUser}>`,
    to: email,
    subject: subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de estado ${status} enviado a ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de estado:', error);
    return false;
  }
}
