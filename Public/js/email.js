// ============================================
// 📧 correo.js — Módulo de envío de correos con diseño profesional
// ============================================
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Correo emisor
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
 * 💙 Enviar correo de bienvenida con credenciales y diseño atractivo.
 */
async function enviarCorreoCredenciales(correo, nombre, contrasenaInicial, rol) {
    const asunto = `¡Bienvenido/a a Vital+! Tu cuenta de ${rol.toUpperCase()} está lista`;

    const html = `
    <div style="background-color:#f6f9fc; padding:40px 0; font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:600px; margin:0 auto; background-color:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- 🩺 Encabezado con logo -->
            <div style="background:linear-gradient(135deg,#007bff,#00bcd4); padding:20px; text-align:center;">
                <img src="https://www.flaticon.es/icono-gratis/medico_11505221?term=logo+hospital&page=1&position=25&origin=search&related_id=11505221" alt="Vital+" width="120" style="margin-bottom:10px;">
                <h1 style="color:white; margin:0; font-size:24px;">¡Bienvenido a Vital+!</h1>
            </div>

            <!-- 🧾 Cuerpo -->
            <div style="padding:30px; color:#333;">
                <p style="font-size:16px;">Hola <strong>${nombre}</strong>,</p>
                <p style="font-size:15px;">Nos complace informarte que tu cuenta ha sido creada exitosamente como <strong>${rol.toUpperCase()}</strong> dentro de la plataforma <strong>Vital+</strong>.</p>

                <div style="background-color:#f4f8ff; border-left:5px solid #007bff; padding:15px 20px; margin:20px 0; border-radius:6px;">
                    <p style="margin:0; font-size:15px;"><strong>Tus credenciales de acceso:</strong></p>
                    <p style="margin:5px 0;"><strong>Correo:</strong> ${correo}</p>
                    <p style="margin:5px 0;"><strong>Contraseña inicial:</strong> 
                        <span style="background-color:#eef5ff; padding:5px 10px; border-radius:5px; font-weight:bold; font-family:monospace;">
                            ${contrasenaInicial}
                        </span>
                    </p>
                </div>

                <p style="font-size:15px;">Por seguridad, te recomendamos cambiar tu contraseña al iniciar sesión por primera vez.</p>


                <p style="font-size:15px;">Gracias por unirte a nuestro equipo 💙<br>
                <strong>El equipo de Vital+</strong></p>
            </div>

            <!-- 📩 Pie -->
            <div style="background-color:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#666;">
                <p style="margin:0;">© 2025 Vital+ Salud Digital. Todos los derechos reservados.</p>
                <p style="margin:0;">Este correo fue generado automáticamente, por favor no responder.</p>
            </div>
        </div>
    </div>
    `;

    return await enviarCorreo(correo, asunto, html);
}

module.exports = {
    enviarCorreo,
    enviarCorreoCredenciales
};
