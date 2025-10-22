// ============================================
// 📄 controladores/UsuarioControlador.js
// ============================================
const usuarioServicio = require('../servicios/UsuarioServicios');

class UsuarioControlador {

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

    async obtenerPerfil(req, res) {
        try {
            // El ID del usuario se obtiene del token (req.usuario.id)
            const usuario = await usuarioServicio.obtenerPerfil(req.usuario.id);
            res.json({ exito: true, datos: usuario });
        } catch (error) {
            res.status(404).json({ exito: false, mensaje: error.message });
        }
    }

    // 🔑 FUNCIÓN CORREGIDA: Actualiza el perfil del usuario autenticado (Ruta: /perfil)
    async actualizarPerfil(req, res) {
        try {
            // Utiliza el ID del usuario extraído del token, no de los parámetros
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

    // 🔑 FUNCIÓN PARA ADMIN: Actualiza un usuario por ID (Ruta: /:id)
    async actualizarUsuario(req, res) {
        try {
            const { id } = req.params; // Usa el ID de la URL
            const usuario = await usuarioServicio.actualizar(id, req.body);
            res.json({
                exito: true,
                mensaje: 'Usuario actualizado',
                datos: usuario
            });
        } catch (error) {
            console.error('❌ Error al actualizar usuario por ID:', error);
            res.status(400).json({ exito: false, mensaje: error.message });
        }
    }

    async obtenerTodos(req, res) {
        try {
            if (req.usuario.rol !== 'admin') {
                return res.status(403).json({
                    exito: false,
                    mensaje: 'No tienes permisos para realizar esta acción'
                });
            }

            const filtros = req.query;
            const usuarios = await usuarioServicio.obtenerTodos(filtros);
            res.json({
                exito: true,
                total: usuarios.length,
                datos: usuarios
            });
        } catch (error) {
            res.status(500).json({ exito: false, mensaje: error.message });
        }
    }

    async crearPersonal(req, res) {
        try {
            if (req.usuario.rol !== 'admin') {
                return res.status(403).json({
                    exito: false,
                    mensaje: 'No tienes permisos para crear personal'
                });
            }

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

            // Llama a la función de servicio que también envía el correo
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
            }, req.usuario.rol);

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
            res.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async obtenerEstadisticas(req, res) {
        try {
            if (req.usuario.rol !== 'admin') {
                return res.status(403).json({
                    exito: false,
                    mensaje: 'No tienes permisos para ver estadísticas'
                });
            }

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
            if (req.usuario.rol !== 'admin') {
                return res.status(403).json({
                    exito: false,
                    mensaje: 'No tienes permisos para desactivar usuarios'
                });
            }

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
            if (req.usuario.rol !== 'admin') {
                return res.status(403).json({
                    exito: false,
                    mensaje: 'No tienes permisos para activar usuarios'
                });
            }

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
}

module.exports = new UsuarioControlador();