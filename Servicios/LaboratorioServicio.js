
// ============================================
// Servicios/LaboratorioServicio.js
// ============================================
const laboratorioRepositorio = require('../Repositorios/LaboratorioRepositorio');

class LaboratorioServicio {

    async obtenerExamenesPendientes() {
        try {
            const examenes = await laboratorioRepositorio.obtenerExamenesPendientes();
            return examenes.map(ex => this.formatearExamen(ex));
        } catch (error) {
            console.error('❌ Error en LaboratorioServicio.obtenerExamenesPendientes:', error);
            throw error;
        }
    }

    async obtenerExamenesEnProceso(idTecnico = null) {
        try {
            const examenes = await laboratorioRepositorio.obtenerExamenesEnProceso(idTecnico);
            return examenes.map(ex => this.formatearExamen(ex));
        } catch (error) {
            console.error('❌ Error en LaboratorioServicio.obtenerExamenesEnProceso:', error);
            throw error;
        }
    }

    async obtenerHistorial(filtros = {}) {
        try {
            const examenes = await laboratorioRepositorio.obtenerHistorial(filtros);
            return examenes.map(ex => this.formatearExamen(ex));
        } catch (error) {
            console.error('❌ Error en LaboratorioServicio.obtenerHistorial:', error);
            throw error;
        }
    }

    async iniciarProcesamiento(idExamen, idTecnico) {
        try {
            const examen = await laboratorioRepositorio.iniciarProcesamiento(idExamen, idTecnico);
            return this.formatearExamen(examen);
        } catch (error) {
            console.error('❌ Error en LaboratorioServicio.iniciarProcesamiento:', error);
            throw error;
        }
    }

    async completarExamen(idExamen, datos) {
        try {
            // Validaciones
            if (!datos.resultado || datos.resultado.trim() === '') {
                throw new Error('El resultado del examen es requerido.');
            }

            if (!datos.estadoResultado) {
                throw new Error('El estado del resultado es requerido.');
            }

            if (!['normal', 'anormal', 'critico'].includes(datos.estadoResultado)) {
                throw new Error('Estado de resultado inválido.');
            }

            const examen = await laboratorioRepositorio.completarExamen(idExamen, datos);
            return this.formatearExamen(examen);
        } catch (error) {
            console.error('❌ Error en LaboratorioServicio.completarExamen:', error);
            throw error;
        }
    }

    async obtenerEstadisticas(idTecnico = null) {
        try {
            return await laboratorioRepositorio.obtenerEstadisticas(idTecnico);
        } catch (error) {
            console.error('❌ Error en LaboratorioServicio.obtenerEstadisticas:', error);
            throw error;
        }
    }

    formatearExamen(examen) {
        const examenJSON = examen.toJSON ? examen.toJSON() : examen;
        const autorizacion = examenJSON.autorizacion || {};

        return {
            id: examenJSON.id,
            idAutorizacion: examenJSON.id_autorizacion,
            estado: examenJSON.estado,
            resultado: examenJSON.resultado,
            observaciones: examenJSON.observaciones,
            estadoResultado: examenJSON.estado_resultado,
            fechaInicio: examenJSON.fecha_inicio,
            fechaRealizacion: examenJSON.fecha_realizacion,
            // Datos de la autorización
            tipo: autorizacion.tipo,
            descripcion: autorizacion.descripcion,
            justificacion: autorizacion.justificacion,
            prioridad: autorizacion.prioridad,
            fechaSolicitud: autorizacion.fecha_solicitud,
            // Médico
            medico: autorizacion.medico ? {
                id: autorizacion.medico.id,
                nombre: autorizacion.medico.nombre,
                especialidad: autorizacion.medico.especialidad
            } : null,
            // Paciente
            paciente: autorizacion.paciente ? {
                id: autorizacion.paciente.id,
                nombre: autorizacion.paciente.nombre,
                correo: autorizacion.paciente.correo,
                telefono: autorizacion.paciente.telefono
            } : null,
            // Técnico
            tecnico: examenJSON.tecnico ? {
                id: examenJSON.tecnico.id,
                nombre: examenJSON.tecnico.nombre
            } : null,
            // Cita
            cita: autorizacion.cita ? {
                id: autorizacion.cita.id,
                fecha: autorizacion.cita.fecha
            } : null
        };
    }
}

module.exports = new LaboratorioServicio();
