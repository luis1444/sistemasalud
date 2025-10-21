// Repositorios/InicioSesionRepositorio.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class InicioSesionRepositorio {
    constructor(dbConnection) {
        this.db = dbConnection;
        this.SECRET_KEY = process.env.JWT_SECRET || 'tu_clave_secreta_aqui';
        this.TOKEN_EXPIRATION = '24h';
    }

    // Buscar usuario por nombre de usuario o email
    async buscarUsuarioPorCredencial(credencial) {
        try {
            const query = `
                SELECT u.*, r.nombre as rol_nombre
                FROM usuarios u
                INNER JOIN roles r ON u.rol_id = r.id
                WHERE (u.email = ? OR u.nombre_usuario = ?) 
                AND u.eliminado = false
            `;

            const [usuarios] = await this.db.execute(query, [credencial, credencial]);
            return usuarios.length > 0 ? usuarios[0] : null;
        } catch (error) {
            console.error('Error al buscar usuario:', error);
            throw new Error('Error en la búsqueda del usuario');
        }
    }

    // Validar contraseña
    async validarContrasena(contrasenaIngresada, contrasenaHasheada) {
        try {
            return await bcrypt.compare(contrasenaIngresada, contrasenaHasheada);
        } catch (error) {
            console.error('Error al validar contraseña:', error);
            throw new Error('Error en la validación de contraseña');
        }
    }

    // Generar token JWT
    generarToken(usuario) {
        const payload = {
            id: usuario.id,
            usuario: usuario.nombre_usuario || usuario.email,
            rol: usuario.rol_nombre,
            email: usuario.email
        };

        return jwt.sign(payload, this.SECRET_KEY, {
            expiresIn: this.TOKEN_EXPIRATION
        });
    }

    // Verificar token
    verificarToken(token) {
        try {
            return jwt.verify(token, this.SECRET_KEY);
        } catch (error) {
            return null;
        }
    }

    // Obtener intentos fallidos
    async obtenerIntentosFallidos(usuarioId) {
        try {
            const query = `
                SELECT intentos_fallidos, bloqueado_hasta
                FROM usuarios
                WHERE id = ?
            `;

            const [resultado] = await this.db.execute(query, [usuarioId]);

            if (resultado.length > 0) {
                return {
                    intentos: resultado[0].intentos_fallidos || 0,
                    bloqueadoHasta: resultado[0].bloqueado_hasta
                };
            }

            return { intentos: 0, bloqueadoHasta: null };
        } catch (error) {
            console.error('Error al obtener intentos fallidos:', error);
            throw new Error('Error al verificar intentos fallidos');
        }
    }

    // Incrementar intentos fallidos
    async incrementarIntentosFallidos(usuarioId) {
        try {
            const query = `
                UPDATE usuarios 
                SET intentos_fallidos = intentos_fallidos + 1,
                    bloqueado_hasta = CASE 
                        WHEN intentos_fallidos + 1 >= 3 
                        THEN DATE_ADD(NOW(), INTERVAL 15 MINUTE)
                        ELSE bloqueado_hasta 
                    END
                WHERE id = ?
            `;

            await this.db.execute(query, [usuarioId]);
        } catch (error) {
            console.error('Error al incrementar intentos fallidos:', error);
            throw new Error('Error al registrar intento fallido');
        }
    }

    // Reiniciar intentos fallidos
    async reiniciarIntentosFallidos(usuarioId) {
        try {
            const query = `
                UPDATE usuarios 
                SET intentos_fallidos = 0,
                    bloqueado_hasta = NULL
                WHERE id = ?
            `;

            await this.db.execute(query, [usuarioId]);
        } catch (error) {
            console.error('Error al reiniciar intentos:', error);
            throw new Error('Error al reiniciar intentos fallidos');
        }
    }

    // Verificar si cuenta está activa
    async verificarCuentaActiva(usuarioId) {
        try {
            const query = `
                SELECT activo, verificado, bloqueado_hasta
                FROM usuarios
                WHERE id = ?
            `;

            const [resultado] = await this.db.execute(query, [usuarioId]);

            if (resultado.length === 0) {
                return { activo: false, verificado: false, bloqueado: false };
            }

            const usuario = resultado[0];
            const bloqueado = usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date();

            return {
                activo: usuario.activo,
                verificado: usuario.verificado,
                bloqueado: bloqueado
            };
        } catch (error) {
            console.error('Error al verificar cuenta:', error);
            throw new Error('Error al verificar estado de cuenta');
        }
    }

    // Verificar contraseña temporal
    async esContrasenaTemporalNoModificada(usuarioId) {
        try {
            const query = `
                SELECT contrasena_temporal, fecha_cambio_contrasena
                FROM usuarios
                WHERE id = ?
            `;

            const [resultado] = await this.db.execute(query, [usuarioId]);

            if (resultado.length > 0) {
                return resultado[0].contrasena_temporal === true &&
                    !resultado[0].fecha_cambio_contrasena;
            }

            return false;
        } catch (error) {
            console.error('Error al verificar contraseña temporal:', error);
            throw new Error('Error al verificar contraseña temporal');
        }
    }

    // Registrar inicio de sesión en auditoría
    async registrarAuditoria(datosAuditoria) {
        try {
            const query = `
                INSERT INTO auditoria_accesos 
                (usuario_id, fecha_hora, direccion_ip, dispositivo, resultado, detalles)
                VALUES (?, NOW(), ?, ?, ?, ?)
            `;

            await this.db.execute(query, [
                datosAuditoria.usuarioId,
                datosAuditoria.ip,
                datosAuditoria.dispositivo,
                datosAuditoria.resultado,
                JSON.stringify(datosAuditoria.detalles || {})
            ]);
        } catch (error) {
            console.error('Error al registrar auditoría:', error);
            // No lanzar error para no interrumpir el flujo de inicio de sesión
        }
    }

    // Actualizar última fecha de acceso
    async actualizarUltimoAcceso(usuarioId) {
        try {
            const query = `
                UPDATE usuarios 
                SET ultimo_acceso = NOW()
                WHERE id = ?
            `;

            await this.db.execute(query, [usuarioId]);
        } catch (error) {
            console.error('Error al actualizar último acceso:', error);
        }
    }

    // Verificar sesión activa
    async verificarSesionActiva(usuarioId) {
        try {
            const query = `
                SELECT id, token, fecha_expiracion
                FROM sesiones_activas
                WHERE usuario_id = ? 
                AND fecha_expiracion > NOW()
                AND activa = true
            `;

            const [sesiones] = await this.db.execute(query, [usuarioId]);
            return sesiones.length > 0 ? sesiones[0] : null;
        } catch (error) {
            console.error('Error al verificar sesión activa:', error);
            return null;
        }
    }

    // Guardar sesión activa
    async guardarSesionActiva(usuarioId, token) {
        try {
            // Primero cerrar sesiones anteriores
            await this.cerrarSesionesActivas(usuarioId);

            const query = `
                INSERT INTO sesiones_activas 
                (usuario_id, token, fecha_inicio, fecha_expiracion, activa)
                VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR), true)
            `;

            await this.db.execute(query, [usuarioId, token]);
        } catch (error) {
            console.error('Error al guardar sesión activa:', error);
            throw new Error('Error al crear sesión');
        }
    }

    // Cerrar sesiones activas
    async cerrarSesionesActivas(usuarioId) {
        try {
            const query = `
                UPDATE sesiones_activas 
                SET activa = false
                WHERE usuario_id = ? AND activa = true
            `;

            await this.db.execute(query, [usuarioId]);
        } catch (error) {
            console.error('Error al cerrar sesiones activas:', error);
        }
    }

    // Obtener portal según rol
    obtenerPortalPorRol(rol) {
        const portales = {
            'Paciente': '/portal/paciente',
            'Médico': '/portal/medico',
            'Auxiliar': '/portal/auxiliar',
            'Laboratorio': '/portal/laboratorio',
            'Farmacia': '/portal/farmacia',
            'Administrador': '/portal/administrador'
        };

        return portales[rol] || '/portal/default';
    }
}

module.exports = InicioSesionRepositorio;