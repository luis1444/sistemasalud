// ============================================
// 📄 servicios/CitaServicio.js
// ============================================
const citaRepositorio = require('../repositorios/CitaRepositorio');

class CitaServicio {

    async obtenerCitasPorMedico(idMedico, fechaInicio = null, fechaFin = null) {
        try {
            return await citaRepositorio.buscarPorMedico(idMedico, fechaInicio, fechaFin);
        } catch (error) {
            console.error('❌ Error en CitaServicio.obtenerCitasPorMedico:', error);
            throw error;
        }
    }

    async obtenerCitasPorPaciente(idPaciente) {
        try {
            return await citaRepositorio.buscarPorPaciente(idPaciente);
        } catch (error) {
            console.error('❌ Error en CitaServicio.obtenerCitasPorPaciente:', error);
            throw error;
        }
    }

    async obtenerCitasDisponibles(idMedico, fecha) {
        try {
            return await citaRepositorio.buscarDisponibles(idMedico, fecha);
        } catch (error) {
            console.error('❌ Error en CitaServicio.obtenerCitasDisponibles:', error);
            throw error;
        }
    }

    async reservarCita(idCita, idPaciente, motivoConsulta = null) {
        try {
            // Validar que la cita existe y está disponible
            const citas = await citaRepositorio.buscarPorMedico(null);
            const cita = citas.find(c => c.id === parseInt(idCita));

            if (!cita) {
                throw new Error('Cita no encontrada.');
            }

            if (cita.estado !== 'disponible') {
                throw new Error('La cita no está disponible.');
            }

            // Actualizar la cita
            return await citaRepositorio.actualizarEstado(idCita, 'reservada', {
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
            return await citaRepositorio.actualizarEstado(idCita, 'cancelada', {
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