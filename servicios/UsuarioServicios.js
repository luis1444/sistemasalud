// ============================================
// 📄 servicios/UsuarioServicios.js
// ============================================
const usuarioRepositorio = require('../repositorios/UsuarioRepositorio');
const jwt = require('jsonwebtoken');

const { enviarCorreo, enviarCorreoCredenciales } = require('../public/js/email');
const emailServicio = require('./emailServicio');

// 🧠 Mapa temporal de recuperación
const codigosRecuperacion = new Map();

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
    // 🔐 RECUPERAR CONTRASEÑA
    // ============================================
    async solicitarRecuperacionContrasena(correo) {
        const usuario = await usuarioRepositorio.buscarPorCorreo(correo);
        if (!usuario) throw new Error('No existe una cuenta con ese correo electrónico');

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        codigosRecuperacion.set(correo, { codigo, expira: Date.now() + 15 * 60 * 1000 });

        const enviado = await emailServicio.enviarCodigoRecuperacion(correo, usuario.nombre, codigo);
        if (!enviado) throw new Error('No se pudo enviar el correo de recuperación');

        setTimeout(() => codigosRecuperacion.delete(correo), 15 * 60 * 1000);

        return { codigo }; // ⚠️ En producción no retornar
    }

    async verificarCodigoRecuperacion(correo, codigo) {
        const datos = codigosRecuperacion.get(correo);
        if (!datos) throw new Error('Código no encontrado o expirado');
        if (Date.now() > datos.expira) {
            codigosRecuperacion.delete(correo);
            throw new Error('El código ha expirado');
        }
        if (datos.codigo !== codigo) throw new Error('Código incorrecto');
        return true;
    }

    async cambiarContrasenaRecuperacion(correo, nuevaContrasena) {
        const usuario = await usuarioRepositorio.buscarPorCorreo(correo);
        if (!usuario) throw new Error('Usuario no encontrado');
        if (nuevaContrasena.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

        await usuarioRepositorio.actualizar(usuario.id, { contrasena: nuevaContrasena });
        codigosRecuperacion.delete(correo);
        return true;
    }

    // ============================================
    // 🧍 REGISTRAR PACIENTE / ADMIN
    // ============================================
    async registrar(datos) {
        const {
            correo,
            contrasena,
            rol,
            nombre,
            identificacion,
            tipoIdentificacion,  // ✅ NUEVO
            fechaNacimiento,
            direccion,
            telefono,
            pais,                // ✅ NUEVO
            ciudad,              // ✅ NUEVO
            nombrePadre          // ✅ NUEVO (opcional)
        } = datos;

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
            tipo_identificacion: tipoIdentificacion || null,
            fecha_nacimiento: fechaNacimiento || null,
            direccion: direccion || null,
            telefono: telefono || null,
            pais: pais || null,
            ciudad: ciudad || null,
            nombre_padre: nombrePadre || null,
            activo: true
        });

        const token = this.generarToken(nuevoUsuario);

        try {
            await enviarCorreoBienvenida(correo, nombre || 'Usuario', rolFinal);
        } catch (err) {
            console.error('⚠️ Error enviando correo al registrar:', err.message);
        }

        return { usuario: nuevoUsuario, token };
    }
    // ============================================
    // 🏥 CREAR PERSONAL (MÉDICO, LAB, FARMACIA)
    // ============================================
    async crearUsuario(datos) {
        const { correo, contrasena, rol, nombre } = datos;

        const rolesPermitidos = ['doctor', 'laboratorio', 'farmacia'];
        if (!rolesPermitidos.includes(rol)) {
            throw new Error(`Rol de personal inválido: ${rol}`);
        }

        if (await usuarioRepositorio.existeCorreo(correo)) {
            throw new Error('El correo ya está registrado.');
        }

        const nuevoUsuario = await usuarioRepositorio.crear(datos);
        if (!nuevoUsuario) throw new Error('Error interno al crear el usuario.');

        try {
            const exitoEnvio = await enviarCorreoCredenciales(
                nuevoUsuario.correo,
                nuevoUsuario.nombre || 'Personal de Salud',
                contrasena,
                nuevoUsuario.rol
            );
            if (exitoEnvio) console.log(`✅ Correo de credenciales enviado a ${nuevoUsuario.correo}`);
        } catch (error) {
            console.error('❌ Error al enviar correo de credenciales:', error.message);
        }

        const usuarioLimpio = nuevoUsuario.toJSON ? nuevoUsuario.toJSON() : nuevoUsuario;
        delete usuarioLimpio.contrasena;
        return usuarioLimpio;
    }

    // ============================================
    // 🔑 AUTENTICACIÓN
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

    // ============================================
    // 👤 PERFIL / CRUD
    // ============================================
    async obtenerPerfil(id) {
        const usuario = await usuarioRepositorio.buscarPorId(id);
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
    }

    // ✅ CORREGIDO: Método obtenerTodos simplificado
    async obtenerTodos(filtros = {}) {
        try {
            // Normalizar el rol a minúsculas si existe
            if (filtros.rol) {
                filtros.rol = filtros.rol.toLowerCase();
            }

            const usuarios = await usuarioRepositorio.buscarTodos(filtros);
            return usuarios;
        } catch (error) {
            console.error('❌ Error en obtenerTodos servicio:', error);
            throw error;
        }
    }

    async obtenerMedicos() {
        try {
            // El repositorio ahora se encargará de incluir la agenda
            return await usuarioRepositorio.obtenerMedicosConAgenda();
        } catch (error) {
            console.error('❌ Error al obtener médicos:', error);
            throw new Error('Error al consultar médicos');
        }
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