// ============================================
// Servicios/AutorizacionServicio.js
// ============================================
const autorizacionRepositorio = require('../Repositorios/AutorizacionRepositorio');
const laboratorioRepositorio = require('../Repositorios/LaboratorioRepositorio');

class AutorizacionServicio {

    async crearAutorizacion(datos, idMedico) {
        try {
            console.log('📥 Datos recibidos:', datos);

            // Normalizar nombres (aceptar ambos formatos)
            const idCita = datos.idCita || datos.id_cita;
            const idPaciente = datos.idPaciente || datos.id_paciente;
            const duracionTratamiento = datos.duracionTratamiento || datos.duracion_tratamiento;

            // Validaciones
            if (!idCita) throw new Error('La cita es requerida');
            if (!idPaciente) throw new Error('El paciente es requerido');
            if (!datos.tipo) throw new Error('El tipo de autorización es requerido');
            if (!datos.descripcion) throw new Error('La descripción es requerida');

            const datosAutorizacion = {
                id_cita: idCita,
                id_medico: idMedico,
                id_paciente: idPaciente,
                tipo: datos.tipo,
                descripcion: datos.descripcion,
                justificacion: datos.justificacion || null,
                prioridad: datos.prioridad || 'media',
                cantidad: datos.cantidad || null,
                duracion_tratamiento: duracionTratamiento || null
            };

            return await autorizacionRepositorio.crear(datosAutorizacion);
        } catch (error) {
            console.error('❌ Error en AutorizacionServicio.crearAutorizacion:', error);
            throw error;
        }
    }

    async aprobarAutorizacion(id, idAprobador, observaciones = null) {
        try {
            console.log('✅ Aprobando autorización:', id);

            // Aprobar la autorización usando actualizarEstado
            const autorizacion = await autorizacionRepositorio.actualizarEstado(
                id,
                'aprobada',
                {
                    id_aprobador: idAprobador,
                    observaciones: observaciones
                }
            );

            console.log('📋 Autorización aprobada:', {
                id: autorizacion.id,
                tipo: autorizacion.tipo,
                estado: autorizacion.estado
            });

            // 🔥 Si es un examen, crear automáticamente el registro en laboratorio
            if (autorizacion.tipo === 'examen') {
                console.log('🧪 Creando examen de laboratorio para autorización:', id);

                try {
                    const examenLab = await laboratorioRepositorio.crearExamenLaboratorio(autorizacion.id);
                    console.log('✅ Examen de laboratorio creado:', examenLab.id);
                } catch (errorLab) {
                    console.error('❌ Error al crear examen de laboratorio:', errorLab);
                }
            }

            return autorizacion;
        } catch (error) {
            console.error('❌ Error en AutorizacionServicio.aprobarAutorizacion:', error);
            throw error;
        }
    }

    async rechazarAutorizacion(id, idAprobador, observaciones) {
        try {
            if (!observaciones || observaciones.trim() === '') {
                throw new Error('Las observaciones son requeridas para rechazar');
            }

            return await autorizacionRepositorio.actualizarEstado(
                id,
                'rechazada',
                {
                    id_aprobador: idAprobador,
                    observaciones: observaciones
                }
            );
        } catch (error) {
            console.error('❌ Error en AutorizacionServicio.rechazarAutorizacion:', error);
            throw error;
        }
    }

    async obtenerPendientes() {
        try {
            const autorizaciones = await autorizacionRepositorio.buscarPorEstado('pendiente');
            return autorizaciones.map(a => this.formatearAutorizacion(a));
        } catch (error) {
            console.error('❌ Error en AutorizacionServicio.obtenerPendientes:', error);
            throw error;
        }
    }

    async obtenerPorId(id) {
        try {
            const autorizacion = await autorizacionRepositorio.buscarPorId(id);
            if (!autorizacion) {
                throw new Error('Autorización no encontrada');
            }
            return this.formatearAutorizacion(autorizacion);
        } catch (error) {
            console.error('❌ Error en AutorizacionServicio.obtenerPorId:', error);
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
        const auth = autorizacion.toJSON ? autorizacion.toJSON() : autorizacion;

        return {
            id: auth.id,
            idCita: auth.id_cita,
            idMedico: auth.id_medico,
            idPaciente: auth.id_paciente,
            tipo: auth.tipo,
            descripcion: auth.descripcion,
            justificacion: auth.justificacion,
            estado: auth.estado,
            prioridad: auth.prioridad,
            fechaSolicitud: auth.fecha_solicitud,
            fechaRespuesta: auth.fecha_respuesta,
            idAprobador: auth.id_aprobador,
            observaciones: auth.observaciones,
            cantidad: auth.cantidad,
            duracionTratamiento: auth.duracion_tratamiento,
            medico: auth.medico ? {
                id: auth.medico.id,
                nombre: auth.medico.nombre,
                especialidad: auth.medico.especialidad
            } : null,
            paciente: auth.paciente ? {
                id: auth.paciente.id,
                nombre: auth.paciente.nombre,
                correo: auth.paciente.correo,
                telefono: auth.paciente.telefono
            } : null,
            cita: auth.cita ? {
                id: auth.cita.id,
                fecha: auth.cita.fecha,
                hora: auth.cita.hora_inicio,
                motivo: auth.cita.motivo_consulta
            } : null,
            aprobador: auth.aprobador ? {
                id: auth.aprobador.id,
                nombre: auth.aprobador.nombre
            } : null
        };
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
}

module.exports = new AutorizacionServicio();