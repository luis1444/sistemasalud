// ============================================
// 📄 servicios/UsuarioServicios.js
// ============================================
const usuarioRepositorio = require('../repositorios/UsuarioRepositorio');
const jwt = require('jsonwebtoken');

// 🔑 CORRECCIÓN DE LA IMPORTACIÓN: Destructuración para obtener las funciones
// Asumiendo que ../public/js/email exporta { enviarCorreo, enviarCorreoCredenciales }
const { enviarCorreo, enviarCorreoCredenciales } = require('../public/js/email');

// 🎯 Función auxiliar para el registro de paciente/admin
async function enviarCorreoBienvenida(correo, nombre, rol) {
    const htmlBienvenida = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Bienvenido a VITAL+</h2>
            <p>Gracias por registrarte en nuestro sistema. Tu rol es: <strong>${rol.toUpperCase()}</strong>.</p>
            <p>Saludos cordiales.</p>
        </div>
    `;
    await enviarCorreo(correo, 'Bienvenido a VITAL+', htmlBienvenida);
}


class UsuarioServicio {


    // ============================================
    // REGISTRAR (PACIENTE / ADMIN)
    // ============================================
    async registrar(datos) {
        const { correo, contrasena, rol, nombre, identificacion, fechaNacimiento, direccion, telefono } = datos;

        let rolFinal = rol || 'paciente';
        if (rolFinal === 'administrador') rolFinal = 'admin';

        if (!['paciente', 'admin'].includes(rolFinal)) {
            throw new Error('Solo se pueden registrar pacientes o administradores');
        }

        if (await usuarioRepositorio.existeCorreo(correo)) {
            throw new Error('El correo ya está registrado');
        }

        if (contrasena.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        const nuevoUsuario = await usuarioRepositorio.crear({
            correo,
            contrasena,
            rol: rolFinal,
            nombre: nombre || null,
            identificacion: identificacion || null,
            fecha_nacimiento: fechaNacimiento || null,
            direccion: direccion || null,
            telefono: telefono || null,
            activo: true
        });

        const token = this.generarToken(nuevoUsuario);

        // ✅ Enviar correo de bienvenida (usa la función auxiliar local)
        try {
            await enviarCorreoBienvenida(
                correo,
                nombre || 'Usuario',
                rolFinal
            );
            console.log(`📧 Correo de bienvenida enviado a ${correo}`);
        } catch (err) {
            console.error('⚠️ Error enviando correo al registrar:', err.message);
        }

        return { usuario: nuevoUsuario, token };
    }


    // ============================================
    // CREAR PERSONAL (MÉDICO, LAB, FARMACIA) - Implementación Solicitada
    // ============================================
    async crearUsuario(datos) {
        const { correo, contrasena, rol, nombre } = datos;

        // Validación de rol de personal
        const rolesPermitidos = ['doctor', 'laboratorio', 'farmacia'];
        if (!rolesPermitidos.includes(rol)) {
            throw new Error(`Rol de personal inválido: ${rol}`);
        }

        if (await usuarioRepositorio.existeCorreo(correo)) {
            throw new Error('El correo ya está registrado.');
        }

        // 1. Crear el usuario (La contraseña se hashea automáticamente)
        const nuevoUsuario = await usuarioRepositorio.crear(datos);

        if (!nuevoUsuario) {
            throw new Error('Error interno al crear el usuario.');
        }

        // 2. 📧 ENVIAR CORREO CON CREDENCIALES (¡Implementación clave!)
        try {
            // Se usa la contraseña SIN HASHEAR ('contrasena') para enviarla por correo.
            const exitoEnvio = await enviarCorreoCredenciales(
                nuevoUsuario.correo,
                nuevoUsuario.nombre || 'Personal de Salud',
                contrasena, // ⚠️ Contraseña simple para el correo
                nuevoUsuario.rol
            );

            if (exitoEnvio) {
                console.log(`✅ Correo de credenciales enviado a ${nuevoUsuario.correo}`);
            }
        } catch (error) {
            console.error('❌ Error fatal al enviar correo de credenciales:', error.message);
            // El error de correo no debe bloquear la creación del usuario
        }

        // Devolver el objeto sin la contraseña
        const usuarioLimpio = nuevoUsuario.toJSON();
        delete usuarioLimpio.contrasena;
        return usuarioLimpio;
    }

    // ============================================
    // OTRAS FUNCIONES
    // ============================================
    async iniciarSesion(correo, contrasena) {
        const usuario = await usuarioRepositorio.buscarPorCorreo(correo);
        if (!usuario) throw new Error('Credenciales inválidas');
        if (!usuario.activo) throw new Error('Usuario inactivo');

        const valida = await usuario.verificarContrasena(contrasena);
        if (!valida) throw new Error('Credenciales inválidas');

        await usuario.actualizarUltimoAcceso();
        const token = this.generarToken(usuario);
        return { usuario, token };
    }

    async obtenerPerfil(id) {
        const usuario = await usuarioRepositorio.buscarPorId(id);
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
    }

    async obtenerTodos(filtros = {}) {
        return await usuarioRepositorio.buscarTodos(filtros);
    }

    async actualizar(id, datos) {
        if (datos.rol) delete datos.rol;
        const usuario = await usuarioRepositorio.actualizar(id, datos);
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
    }

    async desactivar(id) {
        const usuario = await usuarioRepositorio.desactivar(id);
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
    }

    async activar(id) {
        const usuario = await usuarioRepositorio.actualizar(id, { activo: true });
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
    }

    generarToken(usuario) {
        const payload = {
            id: usuario.id,
            correo: usuario.correo,
            rol: usuario.rol,
            nombre: usuario.nombre
        };
        return jwt.sign(payload, process.env.JWT_SECRET || 'vital_plus_secret', { expiresIn: '24h' });
    }

    async obtenerEstadisticas() {
        const pacientes = await usuarioRepositorio.contarPorRol('paciente');
        const doctores = await usuarioRepositorio.contarPorRol('doctor');
        const admins = await usuarioRepositorio.contarPorRol('admin');
        const labs = await usuarioRepositorio.contarPorRol('laboratorio');
        const farmas = await usuarioRepositorio.contarPorRol('farmacia');

        return {
            pacientes,
            doctores,
            administradores: admins,
            laboratorios: labs,
            farmacias: farmas,
            total: pacientes + doctores + admins + labs + farmas
        };
    }
}

module.exports = new UsuarioServicio();