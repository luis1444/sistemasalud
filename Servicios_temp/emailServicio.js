const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function enviarCorreo(destinatario, asunto, html) {
    try {
        await transporter.sendMail({
            from: `"VITAL+ Soporte" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: asunto,
            html
        });
        console.log(`📨 Correo enviado a ${destinatario}`);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar correo:', error.message);
        return false;
    }
}

async function enviarCorreoCredenciales(correo, nombre, contrasenaInicial, rol) {
    const asunto = `¡Bienvenido/a a Vital+! Tu Cuenta de ${rol.toUpperCase()} está Lista`;
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #007bff;">Bienvenido/a a la Plataforma Vital+</h2>
            <p>Estimado/a ${nombre},</p>
            <p>Tu cuenta de acceso como <strong>${rol.toUpperCase()}</strong> ha sido creada por el administrador.</p>
            
            <p style="background-color: #f4f4f4; padding: 15px; border-left: 5px solid #007bff;">
                <strong>Tus datos de acceso son:</strong><br>
                <strong>Usuario (Correo):</strong> ${correo}<br>
                <strong>Contraseña Inicial:</strong> <code>${contrasenaInicial}</code>
            </p>

            <p>Por favor, inicia sesión y cambia tu contraseña por seguridad.</p>
            <p>Saludos cordiales,<br>El equipo de Vital+</p>
        </div>
    `;

    return await enviarCorreo(correo, asunto, html);
}

async function enviarCodigoRecuperacion(correo, nombre, codigo) {
    const asunto = 'Recuperación de Contraseña - VITAL+';
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0077b6, #00b4d8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🔐 VITAL+</h1>
                <p style="color: #e0f7fa; margin: 10px 0 0 0;">Recuperación de Contraseña</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <p>Hola <strong>${nombre || 'Usuario'}</strong>,</p>
                
                <p>Hemos recibido una solicitud para recuperar tu contraseña. Usa el siguiente código de verificación:</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; margin: 25px 0;">
                    <h2 style="color: #0077b6; font-size: 2.5em; letter-spacing: 8px; margin: 0;">${codigo}</h2>
                </div>
                
                <p><strong>⏱️ Este código expirará en 15 minutos.</strong></p>
                
                <p>Si no solicitaste esta recuperación, puedes ignorar este correo de forma segura.</p>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
                
                <p style="font-size: 0.9em; color: #666;">
                    Este es un correo automático, por favor no respondas a este mensaje.
                </p>
                
                <p style="font-size: 0.9em; color: #666;">
                    Saludos,<br>
                    <strong>El equipo de VITAL+</strong>
                </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 0.85em;">
                © 2025 VITAL+ | Sistema de Gestión Hospitalaria
            </div>
        </div>
    `;

    return await enviarCorreo(correo, asunto, html);
}

module.exports = {
    enviarCorreo,
    enviarCorreoCredenciales,
    enviarCodigoRecuperacion
};