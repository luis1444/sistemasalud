// ============================================
// Servicios/LaboratorioServicio.js
// ============================================
const laboratorioRepositorio = require('../repositorios/LaboratorioRepositorio');

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

    // NUEVO: Obtener exámenes con muestra tomada
    async obtenerExamenesConMuestra() {
        try {
            const examenes = await laboratorioRepositorio.obtenerExamenesConMuestra();
            return examenes.map(ex => this.formatearExamen(ex));
        } catch (error) {
            console.error('❌ Error en LaboratorioServicio.obtenerExamenesConMuestra:', error);
            throw error;
        }
    }

    // NUEVO: Obtener exámenes en análisis
    async obtenerExamenesEnAnalisis(idTecnico = null) {
        try {
            const examenes = await laboratorioRepositorio.obtenerExamenesEnAnalisis(idTecnico);
            return examenes.map(ex => this.formatearExamen(ex));
        } catch (error) {
            console.error('❌ Error en LaboratorioServicio.obtenerExamenesEnAnalisis:', error);
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

    // NUEVO: Registrar toma de muestra
    async registrarTomaMuestra(idExamen, idTecnico, datosMuestra) {
        try {
            // Validaciones
            if (!datosMuestra.tipoMuestra || datosMuestra.tipoMuestra.trim() === '') {
                throw new Error('El tipo de muestra es requerido.');
            }

            if (!datosMuestra.codigoMuestra || datosMuestra.codigoMuestra.trim() === '') {
                throw new Error('El código de muestra es requerido.');
            }

            if (!datosMuestra.fechaTomaMuestra) {
                throw new Error('La fecha de toma de muestra es requerida.');
            }

            const examen = await laboratorioRepositorio.registrarTomaMuestra(idExamen, idTecnico, datosMuestra);
            return this.formatearExamen(examen);
        } catch (error) {
            console.error('❌ Error en LaboratorioServicio.registrarTomaMuestra:', error);
            throw error;
        }
    }

    // NUEVO: Iniciar análisis
    async iniciarAnalisis(idExamen, idTecnico, datosAnalisis) {
        try {
            if (!datosAnalisis.fechaInicioAnalisis) {
                throw new Error('La fecha de inicio de análisis es requerida.');
            }

            const examen = await laboratorioRepositorio.iniciarAnalisis(idExamen, idTecnico, datosAnalisis);
            return this.formatearExamen(examen);
        } catch (error) {
            console.error('❌ Error en LaboratorioServicio.iniciarAnalisis:', error);
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
            // NUEVOS CAMPOS para toma de muestra y análisis
            tipoMuestra: examenJSON.tipo_muestra,
            codigoMuestra: examenJSON.codigo_muestra,
            fechaTomaMuestra: examenJSON.fecha_toma_muestra,
            condicionMuestra: examenJSON.condicion_muestra,
            observacionesToma: examenJSON.observaciones_toma,
            fechaInicioAnalisis: examenJSON.fecha_inicio_analisis,
            metodoAnalisis: examenJSON.metodo_analisis,
            notasInicioAnalisis: examenJSON.notas_inicio_analisis,
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