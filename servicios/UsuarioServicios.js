const usuarioRepositorio = require('../repositorios/UsuarioRepositorio');
const jwt = require('jsonwebtoken');

class UsuarioServicio {

    async registrar(datos) {
        const { correo, contrasena, rol, nombre, identificacion, fechaNacimiento, direccion, telefono } = datos;

        // Mapear "administrador" a "admin" para compatibilidad
        let rolFinal = rol || 'paciente';
        if (rolFinal === 'administrador') {
            rolFinal = 'admin';
        }

        // Validar roles permitidos en registro público
        if (!['paciente', 'admin'].includes(rolFinal)) {
            throw new Error('Solo se pueden registrar pacientes o administradores');
        }

        // Validar que el correo no esté registrado
        if (await usuarioRepositorio.existeCorreo(correo)) {
            throw new Error('El correo ya está registrado');
        }

        // Validar longitud de contraseña
        if (contrasena.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        // Crear el nuevo usuario con todos los datos
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

        return { usuario: nuevoUsuario, token };
    }

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

    async cambiarContrasena(id, actual, nueva) {
        const usuario = await usuarioRepositorio.buscarPorId(id);
        if (!usuario) throw new Error('Usuario no encontrado');

        const valida = await usuario.verificarContrasena(actual);
        if (!valida) throw new Error('Contraseña actual incorrecta');

        if (nueva.length < 6) throw new Error('La nueva contraseña debe tener al menos 6 caracteres');

        return await usuarioRepositorio.actualizar(id, { contrasena: nueva });
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

    async crearUsuario(datos, rolCreador) {
        if (rolCreador !== 'admin') throw new Error('No tienes permisos');

        const { correo, contrasena, rol } = datos;

        if (await usuarioRepositorio.existeCorreo(correo))
            throw new Error('El correo ya está registrado');

        const rolesPermitidos = ['paciente', 'doctor', 'admin', 'laboratorio', 'farmacia'];
        if (!rolesPermitidos.includes(rol))
            throw new Error('Rol inválido');

        return await usuarioRepositorio.crear({
            correo,
            contrasena,
            rol,
            activo: true
        });
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

    verificarToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'vital_plus_secret');
        } catch {
            throw new Error('Token inválido o expirado');
        }
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