// ============================================
// 📄 Controladores/AutorizacionControlador.js
// ============================================
const autorizacionServicio = require('../servicios/AutorizacionServicio');

class AutorizacionControlador {

    async crearAutorizacion(req, res) {
        try {
            const idMedico = req.usuario.id;

            const autorizacion = await autorizacionServicio.crearAutorizacion(req.body, idMedico);

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
            const autorizaciones = await autorizacionServicio.obtenerPendientes();

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
    async obtenerMedicamentosPaciente(req, res) {
        try {
            const { idPaciente } = req.params;

            console.log('🔍 Buscando medicamentos del paciente:', idPaciente);

            // Obtener todas las autorizaciones del paciente
            const autorizaciones = await autorizacionServicio.obtenerAutorizacionesPorPaciente(idPaciente);

            console.log('📋 Total autorizaciones encontradas:', autorizaciones.length);

            // Filtrar solo medicamentos (no exámenes)
            const soloMedicamentos = autorizaciones.filter(auth => auth.tipo === 'medicamento');

            console.log('💊 Total medicamentos:', soloMedicamentos.length);

            res.json({
                exito: true,
                total: soloMedicamentos.length,
                datos: soloMedicamentos
            });
        } catch (error) {
            console.error('❌ Error en AutorizacionControlador.obtenerMedicamentosPaciente:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message || 'Error al obtener medicamentos del paciente'
            });
        }
    }
}

// IMPORTANTE: Exportar una INSTANCIA de la clase
module.exports = new AutorizacionControlador();