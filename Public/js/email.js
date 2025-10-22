
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Tu correo
        pass: process.env.EMAIL_PASS  // Contraseña o App Password
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

/**
 * Función específica para enviar credenciales al personal de salud.
 */
async function enviarCorreoCredenciales(correo, nombre, contrasenaInicial, rol) {
    const asunto = `¡Bienvenido/a a Vital+! Tu Cuenta de ${rol.toUpperCase()} está Lista`;
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #007bff;">Bienvenido/a a la Plataforma Vital+</h2>
            <p>Estimado/a ${nombre},</p>
            <p>Tu cuenta de acceso como **${rol.toUpperCase()}** ha sido creada por el administrador.</p>
            
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

module.exports = {
    enviarCorreo,
    enviarCorreoCredenciales // ⬅️ ¡Esta es la clave para la función crearUsuario!
};