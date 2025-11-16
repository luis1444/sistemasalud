
// ============================================
// 📁 Controladores/LaboratorioControlador.js
// ============================================
const laboratorioServicio = require('../Servicios/LaboratorioServicio');

class LaboratorioControlador {

    async obtenerExamenesPendientes(req, res) {
        try {
            const examenes = await laboratorioServicio.obtenerExamenesPendientes();

            res.json({
                exito: true,
                total: examenes.length,
                datos: examenes
            });
        } catch (error) {
            console.error('❌ Error en LaboratorioControlador.obtenerExamenesPendientes:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async obtenerExamenesEnProceso(req, res) {
        try {
            const idTecnico = req.usuario.id;
            const examenes = await laboratorioServicio.obtenerExamenesEnProceso(idTecnico);

            res.json({
                exito: true,
                total: examenes.length,
                datos: examenes
            });
        } catch (error) {
            console.error('❌ Error en LaboratorioControlador.obtenerExamenesEnProceso:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async obtenerHistorial(req, res) {
        try {
            const { periodo } = req.query;
            const idTecnico = req.usuario.id;

            const filtros = {
                periodo: periodo || 'mes',
                idTecnico
            };

            const examenes = await laboratorioServicio.obtenerHistorial(filtros);

            res.json({
                exito: true,
                total: examenes.length,
                datos: examenes
            });
        } catch (error) {
            console.error('❌ Error en LaboratorioControlador.obtenerHistorial:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async iniciarProcesamiento(req, res) {
        try {
            const { idExamen } = req.params;
            const idTecnico = req.usuario.id;

            const examen = await laboratorioServicio.iniciarProcesamiento(idExamen, idTecnico);

            res.json({
                exito: true,
                mensaje: 'Examen iniciado correctamente.',
                datos: examen
            });
        } catch (error) {
            console.error('❌ Error en LaboratorioControlador.iniciarProcesamiento:', error);
            res.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async completarExamen(req, res) {
        try {
            const { idExamen } = req.params;
            const datos = req.body;

            const examen = await laboratorioServicio.completarExamen(idExamen, datos);

            res.json({
                exito: true,
                mensaje: 'Resultados registrados correctamente.',
                datos: examen
            });
        } catch (error) {
            console.error('❌ Error en LaboratorioControlador.completarExamen:', error);
            res.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    async obtenerEstadisticas(req, res) {
        try {
            const idTecnico = req.usuario.id;
            const estadisticas = await laboratorioServicio.obtenerEstadisticas(idTecnico);

            res.json({
                exito: true,
                datos: estadisticas
            });
        } catch (error) {
            console.error('❌ Error en LaboratorioControlador.obtenerEstadisticas:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    }
}

module.exports = new LaboratorioControlador();