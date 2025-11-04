// ============================================
// 📄 controladores/CitaControlador.js (CORREGIDO)
// ============================================
const citaServicio = require('../servicios/CitaServicio');

class CitaControlador {

    // ============================================
    //  Obtener citas de un médico
    // ============================================
    async obtenerCitasMedico(req, res) {
        try {
            const { idMedico } = req.params;
            const { fechaInicio, fechaFin } = req.query;

            const citas = await citaServicio.obtenerCitasPorMedico(
                idMedico,
                fechaInicio,
                fechaFin
            );

            res.json({
                exito: true,
                total: citas.length,
                datos: citas
            });
        } catch (error) {
            console.error('❌ Error en CitaControlador.obtenerCitasMedico:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    // ============================================
    // ✅ NUEVO: Obtener citas del paciente autenticado
    // ============================================
    async obtenerMisCitas(req, res) {
        try {
            // El ID viene del token JWT (middleware authMiddleware)
            const idPaciente = req.usuario.id;

            console.log(`📋 Obteniendo citas del paciente ID: ${idPaciente}`);

            const citas = await citaServicio.obtenerCitasPorPaciente(idPaciente);

            console.log(`✅ Se encontraron ${citas.length} citas para el paciente ${idPaciente}`);

            res.json({
                exito: true,
                total: citas.length,
                datos: citas
            });
        } catch (error) {
            console.error('❌ Error en CitaControlador.obtenerMisCitas:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    // ============================================
    // 👤 Obtener citas de un paciente (por ID específico)
    // ============================================
    async obtenerCitasPaciente(req, res) {
        try {
            const { idPaciente } = req.params;

            const citas = await citaServicio.obtenerCitasPorPaciente(idPaciente);

            res.json({
                exito: true,
                total: citas.length,
                datos: citas
            });
        } catch (error) {
            console.error('❌ Error en CitaControlador.obtenerCitasPaciente:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    // ============================================
    // Obtener citas disponibles de un médico en una fecha
    // ============================================
    async obtenerCitasDisponibles(req, res) {
        try {
            const { idMedico, fecha } = req.params;
            console.log(`🔍 Buscando citas disponibles para médico ${idMedico} en ${fecha}`);

            const citas = await citaServicio.obtenerCitasDisponibles(idMedico, fecha);

            res.json({
                exito: true,
                total: citas.length,
                datos: citas
            });
        } catch (error) {
            console.error('❌ Error en CitaControlador.obtenerCitasDisponibles:', error);
            res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    // ============================================
    //  Reservar una cita
    // ============================================
    async reservarCita(req, res) {
        try {
            const { idCita } = req.params;
            const { motivo_consulta } = req.body;
            const idPaciente = req.usuario.id;

            const citaReservada = await citaServicio.reservarCita(
                idCita,
                idPaciente,
                motivo_consulta
            );

            res.json({
                exito: true,
                mensaje: 'Cita reservada correctamente.',
                datos: citaReservada
            });
        } catch (error) {
            console.error('❌ Error en CitaControlador.reservarCita:', error);
            res.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    // ============================================
    // Cancelar una cita
    // ============================================
    async cancelarCita(req, res) {
        try {
            const { idCita } = req.params;

            const citaCancelada = await citaServicio.cancelarCita(idCita);

            res.json({
                exito: true,
                mensaje: 'Cita cancelada correctamente.',
                datos: citaCancelada
            });
        } catch (error) {
            console.error('❌ Error en CitaControlador.cancelarCita:', error);
            res.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    // ============================================
    //  Completar una cita
    // ============================================
    async completarCita(req, res) {
        try {
            const { idCita } = req.params;
            const { notas } = req.body;

            const citaCompletada = await citaServicio.completarCita(idCita, notas);

            res.json({
                exito: true,
                mensaje: 'Cita completada correctamente.',
                datos: citaCompletada
            });
        } catch (error) {
            console.error('❌ Error en CitaControlador.completarCita:', error);
            res.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    // ============================================
    // Actualizar notas médicas
    // ============================================
    async actualizarNotas(req, res) {
        try {
            const { idCita } = req.params;
            const { notas } = req.body;

            const citaActualizada = await citaServicio.actualizarNotas(idCita, notas);

            res.json({
                exito: true,
                mensaje: 'Notas actualizadas correctamente.',
                datos: citaActualizada
            });
        } catch (error) {
            console.error('❌ Error en CitaControlador.actualizarNotas:', error);
            res.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }
}

module.exports = new CitaControlador();