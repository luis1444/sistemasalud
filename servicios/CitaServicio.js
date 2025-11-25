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
                    hora: citaJSON.hora_inicio,
                    hora_inicio: citaJSON.hora_inicio,
                    hora_fin: citaJSON.hora_fin,
                    duracion: citaJSON.duracion_cita_minutos || 30,
                    estado: citaJSON.estado,
                    motivo: citaJSON.motivo_consulta,
                    motivo_consulta: citaJSON.motivo_consulta,
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
                    hora: citaJSON.hora_inicio,
                    hora_inicio: citaJSON.hora_inicio,
                    hora_fin: citaJSON.hora_fin,
                    duracion: citaJSON.duracion_cita_minutos || 30,
                    estado: citaJSON.estado,
                    motivo: citaJSON.motivo_consulta,
                    motivo_consulta: citaJSON.motivo_consulta,
                    tipoConsulta: 'Consulta General',
                    medicoId: citaJSON.id_medico,
                    medico: citaJSON.medico ? {
                        nombre: citaJSON.medico.nombre,
                        especialidad: citaJSON.medico.especialidad,
                        correo: citaJSON.medico.correo
                    } : null,
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

    // ✅ MÉTODO CORREGIDO: completarCita ahora NO sobrescribe las notas
    async completarCita(idCita, notas = null) {
        try {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ CitaServicio.completarCita');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🆔 ID de cita:', idCita);
            console.log('📝 Notas recibidas:', notas ? `${notas.length} caracteres` : 'NULL/UNDEFINED');

            // ✅ Si NO se envían notas, solo cambiar el estado
            if (!notas) {
                console.log('⚠️ No se recibieron notas, solo se cambiará el estado a completada');
                return await citaRepositorio.actualizarEstado(idCita, 'completada', {});
            }

            // ✅ Si se envían notas, actualizar estado Y notas
            console.log('✅ Se recibieron notas, actualizando estado y notas');
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
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📝 CitaServicio.actualizarNotas');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🆔 ID de cita:', idCita);
            console.log('📄 Notas recibidas:', notas ? `${notas.length} caracteres` : 'NULL/UNDEFINED');

            if (!notas) {
                console.log('⚠️ ADVERTENCIA: Se intentan guardar notas NULL o UNDEFINED');
            } else {
                console.log('📝 Primeros 200 caracteres de las notas:');
                console.log(notas.substring(0, 200));
            }

            console.log('🔄 Llamando a citaRepositorio.actualizarEstado...');

            // ✅ NO cambiar el estado, solo actualizar las notas
            const resultado = await citaRepositorio.actualizarEstado(idCita, null, {
                notas: notas
            });

            console.log('✅ CitaServicio: Notas actualizadas correctamente');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            return resultado;
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