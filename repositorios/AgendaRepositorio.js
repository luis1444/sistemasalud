const Agenda = require('../entidades/Agenda');
const Usuario = require('../entidades/Usuarios'); // Necesario para includes
const { Op } = require('sequelize');

class AgendaRepositorio {

    async crearOActualizar(idMedico, datosAgenda) {
        try {
            const [agenda, created] = await Agenda.findOrCreate({
                where: { id_medico: idMedico },
                defaults: datosAgenda
            });

            if (!created) {
                await agenda.update(datosAgenda);
            }
            return agenda;
        } catch (error) {
            console.error('❌ Error en AgendaRepositorio.crearOActualizar:', error);
            throw new Error('Error al guardar la agenda del médico.');
        }
    }

    async buscarPorIdMedico(idMedico) {
        try {
            return await Agenda.findOne({
                where: { id_medico: idMedico },
                include: [{
                    model: Usuario,
                    as: 'medico',
                    attributes: ['id', 'nombre', 'especialidad', 'correo']
                }]
            });
        } catch (error) {
            console.error('❌ Error en AgendaRepositorio.buscarPorIdMedico:', error);
            throw new Error('Error al buscar la agenda por ID de médico.');
        }
    }

    async buscarTodas() {
        try {
            return await Agenda.findAll({
                include: [{
                    model: Usuario,
                    as: 'medico',
                    attributes: ['id', 'nombre', 'especialidad', 'correo']
                }],
                order: [[{ model: Usuario, as: 'medico' }, 'nombre', 'ASC']]
            });
        } catch (error) {
            console.error('❌ Error en AgendaRepositorio.buscarTodas:', error);
            throw new Error('Error al buscar todas las agendas.');
        }
    }

    async obtenerAgendasDeMedicosSinAgenda() {
        try {
            // Encuentra los IDs de los médicos que YA tienen una agenda
            const medicosConAgenda = await Agenda.findAll({
                attributes: ['id_medico'],
                raw: true,
            });
            const idsMedicosConAgenda = medicosConAgenda.map(a => a.id_medico);

            // Encuentra los médicos que NO están en la lista anterior
            const medicosSinAgenda = await Usuario.findAll({
                where: {
                    rol: 'doctor',
                    activo: true,
                    id: {
                        [Op.notIn]: idsMedicosConAgenda
                    }
                },
                attributes: ['id', 'nombre', 'especialidad', 'correo']
            });
            return medicosSinAgenda;

        } catch (error) {
            console.error('❌ Error en AgendaRepositorio.obtenerAgendasDeMedicosSinAgenda:', error);
            throw new Error('Error al obtener médicos sin agenda.');
        }
    }
}

module.exports = new AgendaRepositorio();