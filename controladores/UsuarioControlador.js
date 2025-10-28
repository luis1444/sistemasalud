// ============================================
// 📄 controladores/UsuarioControlador.js
// ============================================
const usuarioServicio = require('../servicios/UsuarioServicios');

class UsuarioControlador {

    // ============================================
    // REGISTRO
    // ============================================
    async registrar(req, res) {
        try {
            const { correo, contrasena, rol, nombre, identificacion, fechaNacimiento, direccion, telefono } = req.body;

            if (!correo || !contrasena) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'Correo y contraseña son obligatorios'
                });
            }

            const resultado = await usuarioServicio.registrar({
                correo,
                contrasena,
                rol,
                nombre,
                identificacion,
                fechaNacimiento,
                direccion,
                telefono
            });

            res.status(201).json({
                exito: true,
                mensaje: 'Usuario registrado correctamente',
                datos: resultado
            });
        } catch (error) {
            console.error('❌ Error en registro:', error);
            res.status(400).json({ exito: false, mensaje: error.message });
        }
    }

    // ============================================
    // INICIO DE SESIÓN
    // ============================================
    async iniciarSesion(req, res) {
        try {
            const { correo, contrasena } = req.body;
            const resultado = await usuarioServicio.iniciarSesion(correo, contrasena);
            res.json({
                exito: true,
                mensaje: 'Inicio de sesión exitoso',
                datos: resultado
            });
        } catch (error) {
            console.error('❌ Error en inicio de sesión:', error);
            res.status(401).json({ exito: false, mensaje: error.message });
        }
    }

    // ============================================
    // PERFIL
    // ============================================
    async obtenerPerfil(req, res) {
        try {
            const usuario = await usuarioServicio.obtenerPerfil(req.usuario.id);
            res.json({ exito: true, datos: usuario });
        } catch (error) {
            res.status(404).json({ exito: false, mensaje: error.message });
        }
    }

    async actualizarPerfil(req, res) {
        try {
            const idUsuario = req.usuario.id;
            const usuario = await usuarioServicio.actualizar(idUsuario, req.body);

            res.json({
                exito: true,
                mensaje: 'Perfil actualizado',
                datos: usuario
            });
        } catch (error) {
            console.error('❌ Error al actualizar perfil:', error);
            res.status(400).json({ exito: false, mensaje: error.message });
        }
    }

    // ============================================
    // ADMINISTRACIÓN DE USUARIOS
    // ============================================
    async actualizarUsuario(req, res) {
        try {
            const { id } = req.params;
            const usuario = await usuarioServicio.actualizar(id, req.body);
            res.json({
                exito: true,
                mensaje: 'Usuario actualizado',
                datos: usuario
            });
        } catch (error) {
            console.error('❌ Error al actualizar usuario:', error);
            res.status(400).json({ exito: false, mensaje: error.message });
        }
    }

    // ✅ CORREGIDO: Método para obtener usuarios filtrados por rol
    async obtenerPorRol(req, res) {
        try {
            const { rol } = req.query;

            if (!rol) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'Debe especificar un rol en la consulta (ejemplo: ?rol=doctor)'
                });
            }

            const usuarios = await usuarioServicio.obtenerTodos({ rol });

            res.json({
                exito: true,
                total: usuarios.length,
                datos: usuarios
            });
        } catch (error) {
            console.error('❌ Error al obtener usuarios por rol:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message || 'Error al consultar usuarios'
            });
        }
    }

    // ✅ NUEVO: Método específico para obtener médicos
    async obtenerMedicos(req, res) {
        try {
            const medicos = await usuarioServicio.obtenerMedicos();

            res.json({
                exito: true,
                total: medicos.length,
                datos: medicos
            });
        } catch (error) {
            console.error('❌ Error al obtener médicos:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async obtenerTodos(req, res) {
        try {
            const filtros = req.query;
            const usuarios = await usuarioServicio.obtenerTodos(filtros);
            res.json({
                exito: true,
                total: usuarios.length,
                datos: usuarios
            });
        } catch (error) {
            console.error('❌ Error al obtener todos:', error);
            res.status(500).json({ exito: false, mensaje: error.message });
        }
    }

    async crearPersonal(req, res) {
        try {
            const {
                correo,
                contrasena,
                rol,
                nombre,
                identificacion,
                telefono,
                direccion,
                especialidad,
                area
            } = req.body;

            if (!correo || !contrasena || !rol || !nombre || !identificacion) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'Todos los campos obligatorios deben ser completados'
                });
            }

            const nuevoUsuario = await usuarioServicio.crearUsuario({
                correo,
                contrasena,
                rol,
                nombre,
                identificacion,
                telefono,
                direccion,
                especialidad,
                area
            });

            res.status(201).json({
                exito: true,
                mensaje: `${rol === 'doctor' ? 'Médico' : rol.charAt(0).toUpperCase() + rol.slice(1)} registrado correctamente`,
                datos: {
                    id: nuevoUsuario.id,
                    nombre: nuevoUsuario.nombre,
                    correo: nuevoUsuario.correo,
                    rol: nuevoUsuario.rol,
                    identificacion: nuevoUsuario.identificacion
                }
            });
        } catch (error) {
            console.error('❌ Error al crear personal:', error);
            res.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async obtenerEstadisticas(req, res) {
        try {
            const estadisticas = await usuarioServicio.obtenerEstadisticas();
            res.json({
                exito: true,
                datos: estadisticas
            });
        } catch (error) {
            res.status(500).json({ exito: false, mensaje: error.message });
        }
    }

    async desactivarUsuario(req, res) {
        try {
            const { id } = req.params;
            const usuario = await usuarioServicio.desactivar(id);

            res.json({
                exito: true,
                mensaje: 'Usuario desactivado correctamente',
                datos: usuario
            });
        } catch (error) {
            res.status(400).json({ exito: false, mensaje: error.message });
        }
    }

    async activarUsuario(req, res) {
        try {
            const { id } = req.params;
            const usuario = await usuarioServicio.activar(id);

            res.json({
                exito: true,
                mensaje: 'Usuario activado correctamente',
                datos: usuario
            });
        } catch (error) {
            res.status(400).json({ exito: false, mensaje: error.message });
        }
    }

    // ============================================
    // 🔐 RECUPERACIÓN DE CONTRASEÑA
    // ============================================
    async solicitarRecuperacion(req, res) {
        try {
            const { correo } = req.body;
            if (!correo) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'El correo es obligatorio'
                });
            }

            const resultado = await usuarioServicio.solicitarRecuperacionContrasena(correo);

            res.json({
                exito: true,
                mensaje: 'Código de recuperación enviado al correo',
                codigo: resultado.codigo // ⚠️ Solo para desarrollo
            });
        } catch (error) {
            res.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async verificarCodigo(req, res) {
        try {
            const { correo, codigo } = req.body;

            if (!correo || !codigo) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'Correo y código son obligatorios'
                });
            }

            await usuarioServicio.verificarCodigoRecuperacion(correo, codigo);

            res.json({
                exito: true,
                mensaje: 'Código verificado correctamente'
            });
        } catch (error) {
            res.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async cambiarContrasenaRecuperacion(req, res) {
        try {
            const { correo, nuevaContrasena } = req.body;

            if (!correo || !nuevaContrasena) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'Correo y nueva contraseña son obligatorios'
                });
            }

            await usuarioServicio.cambiarContrasenaRecuperacion(correo, nuevaContrasena);

            res.json({
                exito: true,
                mensaje: 'Contraseña cambiada exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }
}

module.exports = new UsuarioControlador();