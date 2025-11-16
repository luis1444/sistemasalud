// ============================================
// 📄 servicios/AutorizacionServicio.js
// ============================================
const autorizacionRepositorio = require('../Repositorios/AutorizacionRepositorio');

class AutorizacionServicio {

    async crearAutorizacion(datos) {
        try {
            // Validar datos requeridos
            if (!datos.id_cita || !datos.id_medico || !datos.id_paciente || !datos.tipo || !datos.descripcion) {
                throw new Error('Faltan datos requeridos para crear la autorización.');
            }

            if (!['medicamento', 'examen'].includes(datos.tipo)) {
                throw new Error('Tipo de autorización inválido. Debe ser "medicamento" o "examen".');
            }

            const autorizacion = await autorizacionRepositorio.crear({
                id_cita: datos.id_cita,
                id_medico: datos.id_medico,
                id_paciente: datos.id_paciente,
                tipo: datos.tipo,
                descripcion: datos.descripcion,
                justificacion: datos.justificacion || null,
                prioridad: datos.prioridad || 'media',
                cantidad: datos.cantidad || null,
                duracion_tratamiento: datos.duracion_tratamiento || null
            });

            return this.formatearAutorizacion(autorizacion);
        } catch (error) {
            console.error('❌ Error en AutorizacionServicio.crearAutorizacion:', error);
            throw error;
        }
    }

    async obtenerAutorizacionesPendientes() {
        try {
            const autorizaciones = await autorizacionRepositorio.buscarPorEstado('pendiente');
            return autorizaciones.map(a => this.formatearAutorizacion(a));
        } catch (error) {
            console.error('❌ Error en AutorizacionServicio.obtenerAutorizacionesPendientes:', error);
            throw error;
        }
    }

    async obtenerAutorizacionPorId(idAutorizacion) {
        try {
            const autorizacion = await autorizacionRepositorio.buscarPorId(idAutorizacion);

            if (!autorizacion) {
                throw new Error('Autorización no encontrada.');
            }

            return this.formatearAutorizacion(autorizacion);
        } catch (error) {
            console.error('❌ Error en AutorizacionServicio.obtenerAutorizacionPorId:', error);
            throw error;
        }
    }

    async aprobarAutorizacion(idAutorizacion, idAprobador, observaciones = null) {
        try {
            const autorizacion = await autorizacionRepositorio.actualizarEstado(
                idAutorizacion,
                'aprobada',
                {
                    id_aprobador: idAprobador,
                    observaciones: observaciones
                }
            );

            return this.formatearAutorizacion(autorizacion);
        } catch (error) {
            console.error('❌ Error en AutorizacionServicio.aprobarAutorizacion:', error);
            throw error;
        }
    }

    async rechazarAutorizacion(idAutorizacion, idAprobador, observaciones) {
        try {
            if (!observaciones) {
                throw new Error('Debe proporcionar observaciones para rechazar una autorización.');
            }

            const autorizacion = await autorizacionRepositorio.actualizarEstado(
                idAutorizacion,
                'rechazada',
                {
                    id_aprobador: idAprobador,
                    observaciones: observaciones
                }
            );

            return this.formatearAutorizacion(autorizacion);
        } catch (error) {
            console.error('❌ Error en AutorizacionServicio.rechazarAutorizacion:', error);
            throw error;
        }
    }

    async obtenerAutorizacionesPorMedico(idMedico, filtros = {}) {
        try {
            const autorizaciones = await autorizacionRepositorio.buscarPorMedico(idMedico, filtros);
            return autorizaciones.map(a => this.formatearAutorizacion(a));
        } catch (error) {
            console.error('❌ Error en AutorizacionServicio.obtenerAutorizacionesPorMedico:', error);
            throw error;
        }
    }

    async obtenerAutorizacionesPorPaciente(idPaciente) {
        try {
            const autorizaciones = await autorizacionRepositorio.buscarPorPaciente(idPaciente);
            return autorizaciones.map(a => this.formatearAutorizacion(a));
        } catch (error) {
            console.error('❌ Error en AutorizacionServicio.obtenerAutorizacionesPorPaciente:', error);
            throw error;
        }
    }

    async obtenerEstadisticas() {
        try {
            return await autorizacionRepositorio.obtenerEstadisticas();
        } catch (error) {
            console.error('❌ Error en AutorizacionServicio.obtenerEstadisticas:', error);
            throw error;
        }
    }

    formatearAutorizacion(autorizacion) {
        const autorizacionJSON = autorizacion.toJSON ? autorizacion.toJSON() : autorizacion;

        return {
            id: autorizacionJSON.id,
            idCita: autorizacionJSON.id_cita,
            tipo: autorizacionJSON.tipo,
            descripcion: autorizacionJSON.descripcion,
            justificacion: autorizacionJSON.justificacion,
            estado: autorizacionJSON.estado,
            prioridad: autorizacionJSON.prioridad,
            fechaSolicitud: autorizacionJSON.fecha_solicitud,
            fechaRespuesta: autorizacionJSON.fecha_respuesta,
            observaciones: autorizacionJSON.observaciones,
            cantidad: autorizacionJSON.cantidad,
            duracionTratamiento: autorizacionJSON.duracion_tratamiento,
            medico: autorizacionJSON.medico ? {
                id: autorizacionJSON.medico.id,
                nombre: autorizacionJSON.medico.nombre,
                especialidad: autorizacionJSON.medico.especialidad
            } : null,
            paciente: autorizacionJSON.paciente ? {
                id: autorizacionJSON.paciente.id,
                nombre: autorizacionJSON.paciente.nombre,
                correo: autorizacionJSON.paciente.correo,
                telefono: autorizacionJSON.paciente.telefono,
                cedula: autorizacionJSON.paciente.cedula
            } : null,
            cita: autorizacionJSON.cita ? {
                id: autorizacionJSON.cita.id,
                fecha: autorizacionJSON.cita.fecha,
                hora: autorizacionJSON.cita.hora_inicio,
                motivo: autorizacionJSON.cita.motivo_consulta
            } : null
        };
    }
}

module.exports = new AutorizacionServicio();