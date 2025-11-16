// ============================================
// 📄 Controladores/AutorizacionControlador.js
// ============================================
const autorizacionServicio = require('../Servicios/AutorizacionServicio');

class AutorizacionControlador {

    async crearAutorizacion(req, res) {
        try {
            const idMedico = req.usuario.id;
            const datos = {
                ...req.body,
                id_medico: idMedico
            };

            const autorizacion = await autorizacionServicio.crearAutorizacion(datos);

            res.status(201).json({
                exito: true,
                mensaje: 'Autorización creada correctamente.',
                datos: autorizacion
            });
        } catch (error) {
            console.error('❌ Error en AutorizacionControlador.crearAutorizacion:', error);
            res.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async obtenerAutorizacionesPendientes(req, res) {
        try {
            const autorizaciones = await autorizacionServicio.obtenerAutorizacionesPendientes();

            res.json({
                exito: true,
                total: autorizaciones.length,
                datos: autorizaciones
            });
        } catch (error) {
            console.error('❌ Error en AutorizacionControlador.obtenerAutorizacionesPendientes:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async obtenerAutorizacionPorId(req, res) {
        try {
            const { idAutorizacion } = req.params;
            const autorizacion = await autorizacionServicio.obtenerAutorizacionPorId(idAutorizacion);

            res.json({
                exito: true,
                datos: autorizacion
            });
        } catch (error) {
            console.error('❌ Error en AutorizacionControlador.obtenerAutorizacionPorId:', error);
            res.status(404).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async aprobarAutorizacion(req, res) {
        try {
            const { idAutorizacion } = req.params;
            const { observaciones } = req.body;
            const idAprobador = req.usuario.id;

            const autorizacion = await autorizacionServicio.aprobarAutorizacion(
                idAutorizacion,
                idAprobador,
                observaciones
            );

            res.json({
                exito: true,
                mensaje: 'Autorización aprobada correctamente.',
                datos: autorizacion
            });
        } catch (error) {
            console.error('❌ Error en AutorizacionControlador.aprobarAutorizacion:', error);
            res.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async rechazarAutorizacion(req, res) {
        try {
            const { idAutorizacion } = req.params;
            const { observaciones } = req.body;
            const idAprobador = req.usuario.id;

            if (!observaciones) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'Las observaciones son requeridas para rechazar una autorización.'
                });
            }

            const autorizacion = await autorizacionServicio.rechazarAutorizacion(
                idAutorizacion,
                idAprobador,
                observaciones
            );

            res.json({
                exito: true,
                mensaje: 'Autorización rechazada correctamente.',
                datos: autorizacion
            });
        } catch (error) {
            console.error('❌ Error en AutorizacionControlador.rechazarAutorizacion:', error);
            res.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async obtenerMisAutorizaciones(req, res) {
        try {
            const idMedico = req.usuario.id;
            const { estado, tipo } = req.query;

            const filtros = {};
            if (estado) filtros.estado = estado;
            if (tipo) filtros.tipo = tipo;

            const autorizaciones = await autorizacionServicio.obtenerAutorizacionesPorMedico(
                idMedico,
                filtros
            );

            res.json({
                exito: true,
                total: autorizaciones.length,
                datos: autorizaciones
            });
        } catch (error) {
            console.error('❌ Error en AutorizacionControlador.obtenerMisAutorizaciones:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async obtenerAutorizacionesPaciente(req, res) {
        try {
            const idPaciente = req.usuario.id;

            const autorizaciones = await autorizacionServicio.obtenerAutorizacionesPorPaciente(idPaciente);

            res.json({
                exito: true,
                total: autorizaciones.length,
                datos: autorizaciones
            });
        } catch (error) {
            console.error('❌ Error en AutorizacionControlador.obtenerAutorizacionesPaciente:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async obtenerEstadisticas(req, res) {
        try {
            const estadisticas = await autorizacionServicio.obtenerEstadisticas();

            res.json({
                exito: true,
                datos: estadisticas
            });
        } catch (error) {
            console.error('❌ Error en AutorizacionControlador.obtenerEstadisticas:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    }
}

// IMPORTANTE: Exportar una INSTANCIA de la clase
module.exports = new AutorizacionControlador();