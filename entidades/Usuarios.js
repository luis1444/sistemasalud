const usuarioRepositorio = require('../repositorios/UsuarioRepositorio');
const jwt = require('jsonwebtoken');

class UsuarioServicio {

    // Registrar nuevo usuario (solo paciente o administrador)
    async registrar(datos) {
        try {
            const { correo, contrasena, rol } = datos;

            // Validar que solo se puedan registrar pacientes o administradores
            if (rol && !['paciente', 'admin'].includes(rol)) {
                throw new Error('Solo se pueden auto-registrar pacientes o administradores');
            }

            // Verificar si el correo ya existe
            const correoExiste = await usuarioRepositorio.existeCorreo(correo);
            if (correoExiste) {
                throw new Error('El correo ya está registrado');
            }

            // Validar longitud de la contraseña
            if (contrasena.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }

            // Crear usuario con rol "paciente" por defecto si no se especifica
            const nuevoUsuario = await usuarioRepositorio.crear({
                correo,
                contrasena,
                rol: rol || 'paciente',
                activo: true
            });

            // Generar token JWT
            const token = this.generarToken(nuevoUsuario);

            return {
                usuario: nuevoUsuario,
                token
            };
        } catch (error) {
            throw error;
        }
    }

    // Iniciar sesión de usuario
    async iniciarSesion(correo, contrasena) {
        try {
            // Buscar usuario por correo
            const usuario = await usuarioRepositorio.buscarPorCorreo(correo);
            if (!usuario) {
                throw new Error('Credenciales inválidas');
            }

            // Verificar si el usuario está activo
            if (!usuario.activo) {
                throw new Error('Usuario inactivo. Contacte al administrador');
            }

            // Verificar contraseña
            const contrasenaValida = await usuario.verificarContrasena(contrasena);
            if (!contrasenaValida) {
                throw new Error('Credenciales inválidas');
            }

            // Actualizar último acceso
            await usuario.actualizarUltimoAcceso();

            // Generar token JWT
            const token = this.generarToken(usuario);

            return {
                usuario,
                token
            };
        } catch (error) {
            throw error;
        }
    }

    // Obtener perfil del usuario
    async obtenerPerfil(id) {
        try {
            const usuario = await usuarioRepositorio.buscarPorId(id);
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }
            return usuario;
        } catch (error) {
            throw error;
        }
    }

    // Obtener todos los usuarios (solo administrador)
    async obtenerTodos(filtros = {}) {
        try {
            return await usuarioRepositorio.buscarTodos(filtros);
        } catch (error) {
            throw error;
        }
    }

    // Actualizar datos de usuario
    async actualizar(id, datos) {
        try {
            // No permitir actualizar el rol mediante este método
            if (datos.rol) {
                delete datos.rol;
            }

            const usuarioActualizado = await usuarioRepositorio.actualizar(id, datos);
            if (!usuarioActualizado) {
                throw new Error('Usuario no encontrado');
            }

            return usuarioActualizado;
        } catch (error) {
            throw error;
        }
    }

    // Cambiar contraseña de usuario
    async cambiarContrasena(id, contrasenaActual, contrasenaNueva) {
        try {
            const usuario = await usuarioRepositorio.buscarPorId(id);
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar contraseña actual
            const contrasenaValida = await usuario.verificarContrasena(contrasenaActual);
            if (!contrasenaValida) {
                throw new Error('La contraseña actual es incorrecta');
            }

            // Validar nueva contraseña
            if (contrasenaNueva.length < 6) {
                throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
            }

            // Actualizar contraseña
            return await usuarioRepositorio.actualizar(id, { contrasena: contrasenaNueva });
        } catch (error) {
            throw error;
        }
    }

    // Desactivar usuario (eliminación lógica)
    async desactivar(id) {
        try {
            const usuario = await usuarioRepositorio.eliminar(id);
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }
            return usuario;
        } catch (error) {
            throw error;
        }
    }

    // Activar usuario
    async activar(id) {
        try {
            const usuario = await usuarioRepositorio.actualizar(id, { activo: true });
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }
            return usuario;
        } catch (error) {
            throw error;
        }
    }

    // Crear usuario (solo administrador) - para doctores, laboratorios, farmacias
    async crearUsuario(datos, rolCreador) {
        try {
            // Solo los administradores pueden crear otros tipos de usuarios
            if (rolCreador !== 'admin') {
                throw new Error('No tienes permisos para crear este tipo de usuario');
            }

            const { correo, contrasena, rol } = datos;

            // Verificar si el correo ya existe
            const correoExiste = await usuarioRepositorio.existeCorreo(correo);
            if (correoExiste) {
                throw new Error('El correo ya está registrado');
            }

            // Validar rol permitido
            const rolesPermitidos = ['paciente', 'doctor', 'admin', 'laboratorio', 'farmacia'];
            if (!rolesPermitidos.includes(rol)) {
                throw new Error('Rol inválido');
            }

            // Crear nuevo usuario
            const nuevoUsuario = await usuarioRepositorio.crear({
                correo,
                contrasena,
                rol,
                activo: true
            });

            return nuevoUsuario;
        } catch (error) {
            throw error;
        }
    }

    // Generar token JWT
    generarToken(usuario) {
        const datosToken = {
            id: usuario.id,
            correo: usuario.correo,
            rol: usuario.rol
        };

        return jwt.sign(datosToken, process.env.JWT_SECRET || 'vital_plus_secreto', {
            expiresIn: '24h'
        });
    }

    // Verificar token JWT
    verificarToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'vital_plus_secreto');
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
    }

    // Obtener estadísticas de usuarios (solo administrador)
    async obtenerEstadisticas() {
        try {
            const totalPacientes = await usuarioRepositorio.contarPorRol('paciente');
            const totalDoctores = await usuarioRepositorio.contarPorRol('doctor');
            const totalAdmins = await usuarioRepositorio.contarPorRol('admin');
            const totalLaboratorios = await usuarioRepositorio.contarPorRol('laboratorio');
            const totalFarmacias = await usuarioRepositorio.contarPorRol('farmacia');

            return {
                pacientes: totalPacientes,
                doctores: totalDoctores,
                administradores: totalAdmins,
                laboratorios: totalLaboratorios,
                farmacias: totalFarmacias,
                total: totalPacientes + totalDoctores + totalAdmins + totalLaboratorios + totalFarmacias
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UsuarioServicio();
