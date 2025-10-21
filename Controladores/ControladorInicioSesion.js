// Controladores/ControladorInicioSesion.js

class ControladorInicioSesion {
    constructor(servicio) {
        this.servicio = servicio;
    }

    // POST /api/auth/login
    async iniciarSesion(req, res) {
        try {
            const { usuario, contrasena } = req.body;

            // Obtener información del dispositivo
            const datosDispositivo = {
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'] || 'Desconocido'
            };

            // Llamar al servicio
            const resultado = await this.servicio.iniciarSesion(
                { usuario, contrasena },
                datosDispositivo
            );

            // Determinar código de estado HTTP
            const statusCode = this._determinarStatusCode(resultado.codigo);

            // Si es exitoso, establecer cookie con el token
            if (resultado.exito) {
                res.cookie('auth_token', resultado.datos.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000 // 24 horas
                });
            }

            return res.status(statusCode).json(resultado);

        } catch (error) {
            console.error('Error en controlador de inicio de sesión:', error);
            return res.status(500).json({
                exito: false,
                codigo: 'ERROR_INTERNO',
                mensaje: 'Error interno del servidor'
            });
        }
    }

    // POST /api/auth/login/forzar
    async forzarInicioSesion(req, res) {
        try {
            const { usuario, contrasena } = req.body;

            const datosDispositivo = {
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'] || 'Desconocido'
            };

            const resultado = await this.servicio.forzarNuevoInicioSesion(
                { usuario, contrasena },
                datosDispositivo
            );

            const statusCode = this._determinarStatusCode(resultado.codigo);

            if (resultado.exito) {
                res.cookie('auth_token', resultado.datos.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000
                });
            }

            return res.status(statusCode).json(resultado);

        } catch (error) {
            console.error('Error al forzar inicio de sesión:', error);
            return res.status(500).json({
                exito: false,
                codigo: 'ERROR_INTERNO',
                mensaje: 'Error interno del servidor'
            });
        }
    }

    // GET /api/auth/verificar
    async verificarSesion(req, res) {
        try {
            const token = req.cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({
                    valido: false,
                    codigo: 'TOKEN_NO_PROPORCIONADO',
                    mensaje: 'No se proporcionó token de autenticación'
                });
            }

            const resultado = await this.servicio.verificarSesion(token);

            const statusCode = resultado.valido ? 200 : 401;
            return res.status(statusCode).json(resultado);

        } catch (error) {
            console.error('Error al verificar sesión:', error);
            return res.status(500).json({
                valido: false,
                codigo: 'ERROR_INTERNO',
                mensaje: 'Error interno del servidor'
            });
        }
    }

    // POST /api/auth/logout
    async cerrarSesion(req, res) {
        try {
            const usuarioId = req.usuario?.id; // Asumiendo que viene del middleware de autenticación

            if (!usuarioId) {
                return res.status(400).json({
                    exito: false,
                    codigo: 'USUARIO_NO_IDENTIFICADO',
                    mensaje: 'No se pudo identificar al usuario'
                });
            }

            const resultado = await this.servicio.cerrarSesion(usuarioId);

            // Limpiar cookie
            res.clearCookie('auth_token');

            return res.status(200).json(resultado);

        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            return res.status(500).json({
                exito: false,
                codigo: 'ERROR_INTERNO',
                mensaje: 'Error interno del servidor'
            });
        }
    }

    // POST /api/auth/refrescar
    async refrescarToken(req, res) {
        try {
            const token = req.cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({
                    exito: false,
                    codigo: 'TOKEN_NO_PROPORCIONADO',
                    mensaje: 'No se proporcionó token de autenticación'
                });
            }

            const verificacion = await this.servicio.verificarSesion(token);

            if (!verificacion.valido) {
                return res.status(401).json({
                    exito: false,
                    codigo: 'TOKEN_INVALIDO',
                    mensaje: 'Token inválido o expirado'
                });
            }

            // Generar nuevo token (esto debería ser parte del servicio)
            // Por ahora retornamos el mismo token si es válido
            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.status(200).json({
                exito: true,
                codigo: 'TOKEN_REFRESCADO',
                mensaje: 'Token refrescado correctamente',
                datos: {
                    token: token
                }
            });

        } catch (error) {
            console.error('Error al refrescar token:', error);
            return res.status(500).json({
                exito: false,
                codigo: 'ERROR_INTERNO',
                mensaje: 'Error interno del servidor'
            });
        }
    }

    // GET /api/auth/estado-cuenta/:usuario
    async obtenerEstadoCuenta(req, res) {
        try {
            const { usuario } = req.params;

            // Este endpoint es útil para verificar el estado antes de intentar login
            // Nota: Limitado para evitar enumeración de usuarios

            return res.status(200).json({
                exito: true,
                mensaje: 'Puede intentar iniciar sesión'
            });

        } catch (error) {
            console.error('Error al obtener estado de cuenta:', error);
            return res.status(500).json({
                exito: false,
                codigo: 'ERROR_INTERNO',
                mensaje: 'Error interno del servidor'
            });
        }
    }

    // ========== MÉTODOS AUXILIARES ==========

    _determinarStatusCode(codigo) {
        const mapaCodigos = {
            'INICIO_SESION_EXITOSO': 200,
            'VALIDACION_ERROR': 400,
            'CREDENCIALES_INVALIDAS': 401,
            'CUENTA_NO_VERIFICADA': 403,
            'CUENTA_DESACTIVADA': 403,
            'CUENTA_BLOQUEADA': 403,
            'CAMBIO_CONTRASENA_REQUERIDO': 403,
            'SESION_ACTIVA': 409,
            'USUARIO_NO_ENCONTRADO': 404,
            'ERROR_SERVIDOR': 500,
            'ERROR_INTERNO': 500
        };

        return mapaCodigos[codigo] || 500;
    }

    // Middleware para verificar autenticación
    async middlewareAutenticacion(req, res, next) {
        try {
            const token = req.cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({
                    exito: false,
                    codigo: 'NO_AUTENTICADO',
                    mensaje: 'Debe iniciar sesión para acceder a este recurso'
                });
            }

            const verificacion = await this.servicio.verificarSesion(token);

            if (!verificacion.valido) {
                return res.status(401).json({
                    exito: false,
                    codigo: 'SESION_INVALIDA',
                    mensaje: 'Su sesión ha expirado o es inválida'
                });
            }

            // Adjuntar información del usuario al request
            req.usuario = verificacion.datos;
            next();

        } catch (error) {
            console.error('Error en middleware de autenticación:', error);
            return res.status(500).json({
                exito: false,
                codigo: 'ERROR_AUTENTICACION',
                mensaje: 'Error al verificar autenticación'
            });
        }
    }

    // Middleware para verificar roles específicos
    middlewareRol(...rolesPermitidos) {
        return (req, res, next) => {
            if (!req.usuario) {
                return res.status(401).json({
                    exito: false,
                    codigo: 'NO_AUTENTICADO',
                    mensaje: 'Debe iniciar sesión'
                });
            }

            if (!rolesPermitidos.includes(req.usuario.rol)) {
                return res.status(403).json({
                    exito: false,
                    codigo: 'ACCESO_DENEGADO',
                    mensaje: 'No tiene permisos para acceder a este recurso'
                });
            }

            next();
        };
    }
}

module.exports = ControladorInicioSesion;