// ============================================
// 📄 servicios/CitaServicio.js (CORREGIDO - SOLUCIÓN COMPLETA)
// ============================================
const citaRepositorio = require('../repositorios/CitaRepositorio');

class CitaServicio {

    async obtenerCitasPorMedico(idMedico, fechaInicio = null, fechaFin = null) {
        try {
            const citas = await citaRepositorio.buscarPorMedico(idMedico, fechaInicio, fechaFin);

            return citas.map(cita => {
                const citaJSON = cita.toJSON ? cita.toJSON() : cita;

                return {
                    id: citaJSON.id,
                    fecha: citaJSON.fecha,
                    // ✅ Enviar ambos formatos para compatibilidad
                    hora: citaJSON.hora_inicio,
                    hora_inicio: citaJSON.hora_inicio,
                    hora_fin: citaJSON.hora_fin,
                    duracion: citaJSON.duracion_cita_minutos || 30,
                    estado: citaJSON.estado,
                    motivo: citaJSON.motivo_consulta,
                    motivo_consulta: citaJSON.motivo_consulta, // ✅ También en formato original
                    tipoConsulta: 'Consulta General',
                    pacienteId: citaJSON.id_paciente,
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

            return citas.map(cita => {
                const citaJSON = cita.toJSON ? cita.toJSON() : cita;

                return {
                    id: citaJSON.id,
                    fecha: citaJSON.fecha,
                    // ✅ CRÍTICO: Enviar ambos formatos
                    hora: citaJSON.hora_inicio,
                    hora_inicio: citaJSON.hora_inicio,
                    hora_fin: citaJSON.hora_fin,
                    duracion: citaJSON.duracion_cita_minutos || 30,
                    estado: citaJSON.estado,
                    motivo: citaJSON.motivo_consulta,
                    motivo_consulta: citaJSON.motivo_consulta, // ✅ También en formato original
                    tipoConsulta: 'Consulta General',
                    medicoId: citaJSON.id_medico,
                    // ✅ Enviar objeto completo del médico
                    medico: citaJSON.medico ? {
                        nombre: citaJSON.medico.nombre,
                        especialidad: citaJSON.medico.especialidad,
                        correo: citaJSON.medico.correo
                    } : null,
                    // ✅ También campos directos para compatibilidad
                    medicoNombre: citaJSON.medico ? citaJSON.medico.nombre : 'Sin asignar',
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
                    hora_inicio: citaJSON.hora_inicio,
                    hora_fin: citaJSON.hora_fin,
                    hora: citaJSON.hora_inicio, // Para compatibilidad
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
            const cita = await citaRepositorio.buscarPorId(idCita);

            if (!cita) {
                throw new Error('Cita no encontrada.');
            }

            if (cita.estado !== 'disponible') {
                throw new Error('La cita no está disponible.');
            }

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

    async iniciarCita(idCita) {
        try {
            const cita = await citaRepositorio.buscarPorId(idCita);

            if (!cita) {
                throw new Error('Cita no encontrada.');
            }

            if (cita.estado !== 'programada') {
                throw new Error('Solo se pueden iniciar citas programadas.');
            }

            return await citaRepositorio.actualizarEstado(idCita, 'en-curso');
        } catch (error) {
            console.error('❌ Error en CitaServicio.iniciarCita:', error);
            throw error;
        }
    }
}

module.exports = new CitaServicio();