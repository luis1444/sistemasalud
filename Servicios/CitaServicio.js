// ============================================
// 📄 servicios/CitaServicio.js (CORREGIDO)
// ============================================
const citaRepositorio = require('../repositorios/CitaRepositorio');

class CitaServicio {

    async obtenerCitasPorMedico(idMedico, fechaInicio = null, fechaFin = null) {
        try {
            const citas = await citaRepositorio.buscarPorMedico(idMedico, fechaInicio, fechaFin);

            // Transformar los datos para el frontend
            return citas.map(cita => {
                const citaJSON = cita.toJSON ? cita.toJSON() : cita;

                return {
                    id: citaJSON.id,
                    fecha: citaJSON.fecha,
                    hora: citaJSON.hora_inicio, // ⚠️ Mapear hora_inicio a hora
                    duracion: citaJSON.duracion_cita_minutos || 30,
                    estado: citaJSON.estado,
                    motivo: citaJSON.motivo_consulta, // ⚠️ Mapear motivo_consulta a motivo
                    tipoConsulta: 'Consulta General',
                    pacienteId: citaJSON.id_paciente,
                    // ⚠️ CRÍTICO: Acceder correctamente al nombre del paciente desde la relación
                    paciente: citaJSON.paciente ? citaJSON.paciente.nombre : 'Sin asignar',
                    pacienteCorreo: citaJSON.paciente ? citaJSON.paciente.correo : null,
                    pacienteTelefono: citaJSON.paciente ? citaJSON.paciente.telefono : null,
                    notas: citaJSON.notas
                };
            });
        } catch (error) {
            console.error('❌ Error en CitaServicio.obtenerCitasPorMedico:', error);
            throw error;
        }
    }

    async obtenerCitasPorPaciente(idPaciente) {
        try {
            const citas = await citaRepositorio.buscarPorPaciente(idPaciente);

            // Transformar los datos para el frontend
            return citas.map(cita => {
                const citaJSON = cita.toJSON ? cita.toJSON() : cita;

                return {
                    id: citaJSON.id,
                    fecha: citaJSON.fecha,
                    hora: citaJSON.hora_inicio,
                    duracion: citaJSON.duracion_cita_minutos || 30,
                    estado: citaJSON.estado,
                    motivo: citaJSON.motivo_consulta,
                    tipoConsulta: 'Consulta General',
                    medicoId: citaJSON.id_medico,
                    medico: citaJSON.medico ? citaJSON.medico.nombre : 'Sin asignar',
                    especialidad: citaJSON.medico ? citaJSON.medico.especialidad : null,
                    notas: citaJSON.notas
                };
            });
        } catch (error) {
            console.error('❌ Error en CitaServicio.obtenerCitasPorPaciente:', error);
            throw error;
        }
    }

    async obtenerCitasDisponibles(idMedico, fecha) {
        try {
            const citas = await citaRepositorio.buscarDisponibles(idMedico, fecha);

            return citas.map(cita => {
                const citaJSON = cita.toJSON ? cita.toJSON() : cita;

                return {
                    id: citaJSON.id,
                    fecha: citaJSON.fecha,
                    hora: citaJSON.hora_inicio,
                    duracion: citaJSON.duracion_cita_minutos || 30,
                    estado: citaJSON.estado
                };
            });
        } catch (error) {
            console.error('❌ Error en CitaServicio.obtenerCitasDisponibles:', error);
            throw error;
        }
    }

    async reservarCita(idCita, idPaciente, motivoConsulta = null) {
        try {
            // Buscar la cita específica
            const cita = await citaRepositorio.buscarPorId(idCita);

            if (!cita) {
                throw new Error('Cita no encontrada.');
            }

            if (cita.estado !== 'disponible') {
                throw new Error('La cita no está disponible.');
            }

            // Actualizar la cita a estado 'programada' (no 'reservada')
            return await citaRepositorio.actualizarEstado(idCita, 'programada', {
                id_paciente: idPaciente,
                motivo_consulta: motivoConsulta
            });
        } catch (error) {
            console.error('❌ Error en CitaServicio.reservarCita:', error);
            throw error;
        }
    }

    async cancelarCita(idCita) {
        try {
            // Al cancelar, volver a estado 'disponible'
            return await citaRepositorio.actualizarEstado(idCita, 'disponible', {
                id_paciente: null,
                motivo_consulta: null
            });
        } catch (error) {
            console.error('❌ Error en CitaServicio.cancelarCita:', error);
            throw error;
        }
    }

    async completarCita(idCita, notas = null) {
        try {
            return await citaRepositorio.actualizarEstado(idCita, 'completada', {
                notas: notas
            });
        } catch (error) {
            console.error('❌ Error en CitaServicio.completarCita:', error);
            throw error;
        }
    }

    async actualizarNotas(idCita, notas) {
        try {
            return await citaRepositorio.actualizarEstado(idCita, null, {
                notas: notas
            });
        } catch (error) {
            console.error('❌ Error en CitaServicio.actualizarNotas:', error);
            throw error;
        }
    }
}

module.exports = new CitaServicio();