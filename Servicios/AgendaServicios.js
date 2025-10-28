const agendaRepositorio = require('../repositorios/AgendaRepositorio');
const usuarioRepositorio = require('../repositorios/UsuarioRepositorio');

class AgendaServicio {

    async obtenerAgendaPorMedico(idMedico) {
        return await agendaRepositorio.buscarPorIdMedico(idMedico);
    }

    async guardarAgenda(idMedico, datosAgenda) {
        // Validaciones básicas
        if (!idMedico) throw new Error('ID de médico es obligatorio.');
        if (!datosAgenda.dias_disponibles || !Array.isArray(datosAgenda.dias_disponibles)) {
            throw new Error('Los días disponibles son obligatorios y deben ser un array.');
        }
        if (datosAgenda.duracion_cita_minutos < 15 || datosAgenda.duracion_cita_minutos > 120) {
            throw new Error('La duración de la cita debe estar entre 15 y 120 minutos.');
        }

        // Puedes añadir más validaciones de formato de hora si es necesario
        // Ej: '08:00' debe ser un formato de hora válido

        return await agendaRepositorio.crearOActualizar(idMedico, datosAgenda);
    }

    async autoOrganizarAgendas() {
        const medicosSinAgenda = await agendaRepositorio.obtenerAgendasDeMedicosSinAgenda();
        const promesas = medicosSinAgenda.map(medico => {
            const agendaPorDefecto = {
                dias_disponibles: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
                hora_inicio_manana: '08:00',
                hora_fin_manana: '12:00',
                hora_inicio_tarde: '14:00',
                hora_fin_tarde: '18:00',
                duracion_cita_minutos: 30
            };
            return agendaRepositorio.crearOActualizar(medico.id, agendaPorDefecto);
        });
        await Promise.all(promesas);
        return {
            totalOrganizados: medicosSinAgenda.length,
            medicos: medicosSinAgenda.map(m => m.nombre)
        };
    }

    async obtenerTodasLasAgendas() {
        return await agendaRepositorio.buscarTodas();
    }
}

module.exports = new AgendaServicio();