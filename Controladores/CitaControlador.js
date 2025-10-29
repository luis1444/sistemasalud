// ============================================
// 📄 controladores/CitaControlador.js
// ============================================

const { Cita, Usuario } = require('../entidades/asociaciones'); // asegúrate de que Cita esté asociado
const { Op } = require('sequelize');

// ============================================
// 📅 Obtener citas de un médico
// ============================================
exports.obtenerCitasMedico = async (req, res) => {
    const { idMedico } = req.params;
    try {
        const citas = await Cita.findAll({
            where: { idMedico },
            include: [{ model: Usuario, as: 'paciente', attributes: ['id', 'nombre', 'apellido'] }],
            order: [['fecha', 'ASC']]
        });
        res.json(citas);
    } catch (error) {
        console.error('❌ Error al obtener citas del médico:', error);
        res.status(500).json({ error: 'Error al obtener citas del médico' });
    }
};

// ============================================
// 👤 Obtener citas de un paciente
// ============================================
exports.obtenerCitasPaciente = async (req, res) => {
    const { idPaciente } = req.params;
    try {
        const citas = await Cita.findAll({
            where: { idPaciente },
            include: [{ model: Usuario, as: 'medico', attributes: ['id', 'nombre', 'apellido'] }],
            order: [['fecha', 'ASC']]
        });
        res.json(citas);
    } catch (error) {
        console.error('❌ Error al obtener citas del paciente:', error);
        res.status(500).json({ error: 'Error al obtener citas del paciente' });
    }
};

// ============================================
// 🔍 Obtener citas disponibles de un médico en una fecha
// ============================================
exports.obtenerCitasDisponibles = async (req, res) => {
    const { idMedico, fecha } = req.params;
    try {
        const citas = await Cita.findAll({
            where: {
                idMedico,
                fecha,
                estado: 'disponible'
            },
            order: [['hora', 'ASC']]
        });
        res.json(citas);
    } catch (error) {
        console.error('❌ Error al obtener citas disponibles:', error);
        res.status(500).json({ error: 'Error al obtener citas disponibles' });
    }
};

// ============================================
// ✅ Reservar una cita
// ============================================
exports.reservarCita = async (req, res) => {
    const { idCita } = req.params;
    const idPaciente = req.usuario.id; // viene del token JWT

    try {
        const cita = await Cita.findByPk(idCita);
        if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });

        if (cita.estado !== 'disponible') {
            return res.status(400).json({ error: 'La cita no está disponible' });
        }

        cita.idPaciente = idPaciente;
        cita.estado = 'reservada';
        await cita.save();

        res.json({ mensaje: 'Cita reservada correctamente', cita });
    } catch (error) {
        console.error('❌ Error al reservar cita:', error);
        res.status(500).json({ error: 'Error al reservar cita' });
    }
};

// ============================================
// ❌ Cancelar una cita
// ============================================
exports.cancelarCita = async (req, res) => {
    const { idCita } = req.params;
    try {
        const cita = await Cita.findByPk(idCita);
        if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });

        cita.estado = 'cancelada';
        await cita.save();

        res.json({ mensaje: 'Cita cancelada correctamente' });
    } catch (error) {
        console.error('❌ Error al cancelar cita:', error);
        res.status(500).json({ error: 'Error al cancelar cita' });
    }
};

// ============================================
// ✔️ Completar una cita
// ============================================
exports.completarCita = async (req, res) => {
    const { idCita } = req.params;
    try {
        const cita = await Cita.findByPk(idCita);
        if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });

        cita.estado = 'completada';
        await cita.save();

        res.json({ mensaje: 'Cita completada correctamente' });
    } catch (error) {
        console.error('❌ Error al completar cita:', error);
        res.status(500).json({ error: 'Error al completar cita' });
    }
};

// ============================================
// 📝 Actualizar notas médicas
// ============================================
exports.actualizarNotas = async (req, res) => {
    const { idCita } = req.params;
    const { notas } = req.body;
    try {
        const cita = await Cita.findByPk(idCita);
        if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });

        cita.notas = notas;
        await cita.save();

        res.json({ mensaje: 'Notas actualizadas correctamente', cita });
    } catch (error) {
        console.error('❌ Error al actualizar notas:', error);
        res.status(500).json({ error: 'Error al actualizar notas' });
    }
};

