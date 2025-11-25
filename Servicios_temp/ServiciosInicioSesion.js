// Servicios/ServiciosInicioSesion.js

const InicioSesion = require('../entidades/asociaciones');

class ServicioInicioSesion {
    constructor(repositorio) {
        this.repositorio = repositorio;
    }

    // Proceso principal de inicio de sesión
    async iniciarSesion(credenciales, datosDispositivo = {}) {
        try {
            // 1. Crear entidad de inicio de sesión
            const inicioSesion = new InicioSesion({
                usuario: credenciales.usuario,
                contrasena: credenciales.contrasena,
                direccionIP: datosDispositivo.ip || '',
                dispositivo: datosDispositivo.userAgent || ''
            });

            // 2. Validar formulario
            const validacion = inicioSesion.validarFormulario();
            if (!validacion.valido) {
                return {
                    exito: false,
                    codigo: 'VALIDACION_ERROR',
                    mensaje: 'Datos de entrada inválidos',
                    errores: validacion.errores
                };
            }

            // 3. Buscar usuario en la base de datos
            const usuario = await this.repositorio.buscarUsuarioPorCredencial(credenciales.usuario);

            if (!usuario) {
                // No revelar si el usuario existe o no por seguridad
                await this._registrarIntentoFallido(null, inicioSesion, 'Usuario no encontrado');
                return {
                    exito: false,
                    codigo: 'CREDENCIALES_INVALIDAS',
                    mensaje: 'Usuario o contraseña incorrectos'
                };
            }

            // 4. Verificar estado de la cuenta
            const estadoCuenta = await this._verificarEstadoCuenta(usuario.id);
            if (!estadoCuenta.puede_acceder) {
                await this._registrarIntentoFallido(usuario.id, inicioSesion, estadoCuenta.razon);
                return estadoCuenta.respuesta;
            }

            // 5. Validar contraseña
            const contrasenaValida = await this.repositorio.validarContrasena(
                credenciales.contrasena,
                usuario.contrasena
            );

            if (!contrasenaValida) {
                await this.repositorio.incrementarIntentosFallidos(usuario.id);
                const intentos = await this.repositorio.obtenerIntentosFallidos(usuario.id);

                await this._registrarIntentoFallido(usuario.id, inicioSesion, 'Contraseña incorrecta');

                if (intentos.intentos >= 2) {
                    return {
                        exito: false,
                        codigo: 'CUENTA_BLOQUEADA',
                        mensaje: 'Cuenta bloqueada temporalmente por múltiples intentos fallidos',
                        intentosRestantes: 0
                    };
                }

                return {
                    exito: false,
                    codigo: 'CREDENCIALES_INVALIDAS',
                    mensaje: 'Usuario o contraseña incorrectos',
                    intentosRestantes: 3 - intentos.intentos
                };
            }

            // 6. Verificar contraseña temporal
            const esTemporalPendiente = await this.repositorio.esContrasenaTemporalNoModificada(usuario.id);
            if (esTemporalPendiente) {
                return {
                    exito: false,
                    codigo: 'CAMBIO_CONTRASENA_REQUERIDO',
                    mensaje: 'Debe cambiar su contraseña temporal antes de continuar',
                    requireCambioContrasena: true,
                    usuarioId: usuario.id
                };
            }

            // 7. Verificar sesión activa
            const sesionActiva = await this.repositorio.verificarSesionActiva(usuario.id);
            if (sesionActiva) {
                return {
                    exito: false,
                    codigo: 'SESION_ACTIVA',
                    mensaje: 'Ya tiene una sesión activa. ¿Desea cerrar la sesión anterior?',
                    requireConfirmacion: true,
                    usuarioId: usuario.id
                };
            }

            // 8. Generar token y crear sesión
            const token = this.repositorio.generarToken(usuario);
            await this.repositorio.guardarSesionActiva(usuario.id, token);
            await this.repositorio.reiniciarIntentosFallidos(usuario.id);
            await this.repositorio.actualizarUltimoAcceso(usuario.id);

            // 9. Obtener portal de redirección
            const portal = this.repositorio.obtenerPortalPorRol(usuario.rol_nombre);

            // 10. Registrar auditoría exitosa
            await this._registrarAuditoriaExitosa(usuario.id, inicioSesion);

            // 11. Retornar respuesta exitosa
            return {
                exito: true,
                codigo: 'INICIO_SESION_EXITOSO',
                mensaje: 'Inicio de sesión exitoso',
                datos: {
                    token: token,
                    usuario: {
                        id: usuario.id,
                        nombre: usuario.nombre_completo,
                        email: usuario.email,
                        rol: usuario.rol_nombre
                    },
                    portal: portal,
                    expiraEn: '24h'
                }
            };

        } catch (error) {
            console.error('Error en servicio de inicio de sesión:', error);
            return {
                exito: false,
                codigo: 'ERROR_SERVIDOR',
                mensaje: 'Error al procesar la solicitud. Intente nuevamente.'
            };
        }
    }

    // Cerrar sesión anterior y permitir nuevo inicio
    async forzarNuevoInicioSesion(credenciales, datosDispositivo = {}) {
        try {
            const usuario = await this.repositorio.buscarUsuarioPorCredencial(credenciales.usuario);

            if (!usuario) {
                return {
                    exito: false,
                    codigo: 'USUARIO_NO_ENCONTRADO',
                    mensaje: 'Usuario no encontrado'
                };
            }

            // Cerrar sesiones activas
            await this.repositorio.cerrarSesionesActivas(usuario.id);

            // Iniciar nueva sesión
            return await this.iniciarSesion(credenciales, datosDispositivo);

        } catch (error) {
            console.error('Error al forzar nuevo inicio de sesión:', error);
            return {
                exito: false,
                codigo: 'ERROR_SERVIDOR',
                mensaje: 'Error al procesar la solicitud'
            };
        }
    }

    // Verificar token de sesión
    async verificarSesion(token) {
        try {
            const datosToken = this.repositorio.verificarToken(token);

            if (!datosToken) {
                return {
                    valido: false,
                    codigo: 'TOKEN_INVALIDO',
                    mensaje: 'Token inválido o expirado'
                };
            }

            return {
                valido: true,
                codigo: 'TOKEN_VALIDO',
                datos: datosToken
            };

        } catch (error) {
            console.error('Error al verificar sesión:', error);
            return {
                valido: false,
                codigo: 'ERROR_VERIFICACION',
                mensaje: 'Error al verificar la sesión'
            };
        }
    }

    // Cerrar sesión
    async cerrarSesion(usuarioId) {
        try {
            await this.repositorio.cerrarSesionesActivas(usuarioId);

            return {
                exito: true,
                codigo: 'SESION_CERRADA',
                mensaje: 'Sesión cerrada correctamente'
            };

        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            return {
                exito: false,
                codigo: 'ERROR_CIERRE_SESION',
                mensaje: 'Error al cerrar la sesión'
            };
        }
    }

    // ========== MÉTODOS PRIVADOS ==========

    async _verificarEstadoCuenta(usuarioId) {
        const estado = await this.repositorio.verificarCuentaActiva(usuarioId);

        // Cuenta no verificada
        if (!estado.verificado) {
            return {
                puede_acceder: false,
                razon: 'Cuenta no verificada',
                respuesta: {
                    exito: false,
                    codigo: 'CUENTA_NO_VERIFICADA',
                    mensaje: 'Debe activar su cuenta antes de iniciar sesión. Revise su correo electrónico.',
                    requireActivacion: true
                }
            };
        }

        // Cuenta desactivada
        if (!estado.activo) {
            return {
                puede_acceder: false,
                razon: 'Cuenta desactivada',
                respuesta: {
                    exito: false,
                    codigo: 'CUENTA_DESACTIVADA',
                    mensaje: 'Su cuenta ha sido desactivada. Contacte al administrador.'
                }
            };
        }

        // Cuenta bloqueada temporalmente
        if (estado.bloqueado) {
            return {
                puede_acceder: false,
                razon: 'Cuenta bloqueada',
                respuesta: {
                    exito: false,
                    codigo: 'CUENTA_BLOQUEADA',
                    mensaje: 'Cuenta bloqueada temporalmente. Revise su correo electrónico.'
                }
            };
        }

        return { puede_acceder: true };
    }

    async _registrarIntentoFallido(usuarioId, inicioSesion, razon) {
        await this.repositorio.registrarAuditoria({
            usuarioId: usuarioId,
            ip: inicioSesion.direccionIP,
            dispositivo: inicioSesion.dispositivo,
            resultado: 'fallo',
            detalles: { razon: razon }
        });
    }

    async _registrarAuditoriaExitosa(usuarioId, inicioSesion) {
        await this.repositorio.registrarAuditoria({
            usuarioId: usuarioId,
            ip: inicioSesion.direccionIP,
            dispositivo: inicioSesion.dispositivo,
            resultado: 'exito',
            detalles: { mensaje: 'Inicio de sesión exitoso' }
        });
    }
}

module.exports = ServicioInicioSesion;