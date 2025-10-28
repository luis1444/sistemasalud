const agendaServicio = require('../servicios/AgendaServicios');
const usuarioServicio = require('../servicios/UsuarioServicios');

class AgendaControlador {

    async obtenerAgendaMedico(req, res) {
        try {
            const { idMedico } = req.params;
            const agenda = await agendaServicio.obtenerAgendaPorMedico(idMedico);

            if (!agenda) {
                return res.status(404).json({
                    exito: false,
                    mensaje: 'Agenda no encontrada para este médico.'
                });
            }

            res.json({ exito: true, datos: agenda });
        } catch (error) {
            console.error('❌ Error en AgendaControlador.obtenerAgendaMedico:', error);
            res.status(500).json({ exito: false, mensaje: error.message });
        }
    }

    async guardarAgendaMedico(req, res) {
        try {
            const { idMedico } = req.params;
            const datosAgenda = req.body;

            // Validar que el médico exista y sea un 'doctor'
            const medico = await usuarioServicio.obtenerPerfil(idMedico);
            if (!medico || medico.rol !== 'doctor') {
                return res.status(404).json({
                    exito: false,
                    mensaje: 'Médico no encontrado o no es un doctor.'
                });
            }

            // Guardar la configuración de la agenda
            const agendaGuardada = await agendaServicio.guardarAgenda(idMedico, datosAgenda);

            // Generar las citas automáticamente
            await agendaServicio.generarCitasAutomaticas(idMedico, agendaGuardada);

            res.status(200).json({
                exito: true,
                mensaje: 'Agenda guardada y citas generadas correctamente.',
                datos: agendaGuardada
            });
        } catch (error) {
            console.error('❌ Error en AgendaControlador.guardarAgendaMedico:', error);
            res.status(400).json({ exito: false, mensaje: error.message });
        }
    }

    async autoOrganizarAgendas(req, res) {
        try {
            const resultado = await agendaServicio.autoOrganizarAgendas();
            res.json({
                exito: true,
                mensaje: 'Agendas organizadas automáticamente.',
                datos: resultado
            });
        } catch (error) {
            console.error('❌ Error en AgendaControlador.autoOrganizarAgendas:', error);
            res.status(500).json({ exito: false, mensaje: error.message });
        }
    }

    async obtenerTodasLasAgendas(req, res) {
        try {
            const agendas = await agendaServicio.obtenerTodasLasAgendas();
            res.json({ exito: true, total: agendas.length, datos: agendas });
        } catch (error) {
            console.error('❌ Error en AgendaControlador.obtenerTodasLasAgendas:', error);
            res.status(500).json({ exito: false, mensaje: error.message });
        }
    }
}

module.exports = new AgendaControlador();