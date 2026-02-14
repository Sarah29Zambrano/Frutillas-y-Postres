import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    secure: true, // true para puerto 465, false para otros puertos
    port: process.env.EMAIL_PORT || 465,
  });
}

export const verifyEmailConnection = async () => {
  const transporter = createTransporter();
  try {
    await transporter.verify();
    console.log("Conexión de correo verificada correctamente");
    return true;
  } catch (error) {
    console.error("Error en la conexión de correo:", error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    const transporter = createTransporter();
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .button { background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; }
            .warning { color: #d9534f; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Recuperación de Contraseña</h1>
            </div>
            <div class="content">
              <p>Hola,</p>
              <p>Hemos recibido una solicitud para restablecer tu contraseña. Si tú no hiciste esta solicitud, puedes ignorar este correo.</p>
              <p>Para restablecer tu contraseña, haz clic en el siguiente botón o copia el enlace en tu navegador:</p>
              <p><a href="${resetUrl}" class="button">Restablecer Contraseña</a></p>
              <p>O copia este enlace en tu navegador:</p>
              <p style="word-break: break-all; background-color: #fff; padding: 10px; border-left: 4px solid #007bff;">
                ${resetUrl}
              </p>
              <p class="warning">⚠️ Este enlace expirará en 1 hora por razones de seguridad.</p>
              <p>Si tienes problemas, contacta con nuestro equipo de soporte.</p>
              <p>Saludos,<br>El equipo de la aplicación</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Mi Ecommerce. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    console.log("Enviando correo de recuperación a:", transporter);
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Recuperación de Contraseña - Tu Ecommerce",
      html: htmlContent,
      text: `Para restablecer tu contraseña, accede a: ${resetUrl}. Este enlace expirará en 1 hora.`,
    });

    return {
      success: true,
      messageId: result.messageId,
      message: "Correo de recuperación enviado correctamente",
    };
  } catch (error) {
    console.error("Error al enviar correo de recuperación:", error);
    throw new Error(`Error al enviar correo: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido, ${firstName}!</h1>
            </div>
            <div class="content">
              <p>Hola ${firstName},</p>
              <p>¡Tu cuenta ha sido creada exitosamente! Te damos la bienvenida a nuestra comunidad.</p>
              <p>Ahora puedes:</p>
              <ul>
                <li>Explorar nuestros productos</li>
                <li>Crear listas de deseos</li>
                <li>Realizar compras seguras</li>
                <li>Rastrear tus pedidos</li>
              </ul>
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              <p>Saludos,<br>El equipo de la aplicación</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Mi Ecommerce. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "¡Bienvenido a nuestro Ecommerce!",
      html: htmlContent,
      text: `Bienvenido ${firstName}, tu cuenta ha sido creada exitosamente.`,
    });

    return {
      success: true,
      messageId: result.messageId,
      message: "Correo de bienvenida enviado correctamente",
    };
  } catch (error) {
    console.error("Error al enviar correo de bienvenida:", error);
    throw new Error(`Error al enviar correo: ${error.message}`);
  }
};

export const sendOrderConfirmationEmail = async (email, orderData) => {
  try {
    const transporter = createTransporter();
    const itemsHtml = orderData.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
            .footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Confirmación de Compra</h1>
            </div>
            <div class="content">
              <p>¡Gracias por tu compra!</p>
              <p>Número de pedido: <strong>#${orderData.orderId}</strong></p>
              <p>Fecha: ${new Date(orderData.date).toLocaleDateString("es-ES")}</p>
              
              <h3>Detalle del Pedido:</h3>
              <table>
                <thead style="background-color: #007bff; color: white;">
                  <tr>
                    <th style="padding: 10px;">Producto</th>
                    <th style="padding: 10px; text-align: center;">Cantidad</th>
                    <th style="padding: 10px; text-align: right;">Precio</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div class="total">
                Total: $${orderData.total.toFixed(2)}
              </div>

              <p>Tu pedido será procesado pronto. Recibirás un correo con los detalles del envío.</p>
              <p>Saludos,<br>El equipo de la aplicación</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Mi Ecommerce. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: `Confirmación de Compra - Pedido #${orderData.orderId}`,
      html: htmlContent,
      text: `Tu pedido #${orderData.orderId} ha sido confirmado. Total: $${orderData.total.toFixed(2)}`,
    });

    return {
      success: true,
      messageId: result.messageId,
      message: "Correo de confirmación de compra enviado correctamente",
    };
  } catch (error) {
    console.error("Error al enviar correo de confirmación:", error);
    throw new Error(`Error al enviar correo: ${error.message}`);
  }
};

export const sendEmail = async (to, subject, html, text = "") => {
  const transporter = createTransporter();
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ""),
    });

    return {
      success: true,
      messageId: result.messageId,
      message: "Correo enviado correctamente",
    };
  } catch (error) {
    console.error("Error al enviar correo:", error);
    throw new Error(`Error al enviar correo: ${error.message}`);
  }
};
