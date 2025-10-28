const Cita = require('../entidades/Cita');
const Usuario = require('../entidades/Usuarios');
const { Op } = require('sequelize');

class CitaRepositorio {

    async crearMultiples(citas) {
        try {
            return await Cita.bulkCreate(citas, {
                ignoreDuplicates: true // Evitar duplicados
            });
        } catch (error) {
            console.error('❌ Error en CitaRepositorio.crearMultiples:', error);
            throw new Error('Error al crear múltiples citas.');
        }
    }

    async eliminarCitasFuturasDisponibles(idMedico) {
        try {
            const hoy = new Date().toISOString().split('T')[0];

            return await Cita.destroy({
                where: {
                    id_medico: idMedico,
                    fecha: {
                        [Op.gte]: hoy
                    },
                    estado: 'disponible'
                }
            });
        } catch (error) {
            console.error('❌ Error en CitaRepositorio.eliminarCitasFuturasDisponibles:', error);
            throw new Error('Error al eliminar citas futuras disponibles.');
        }
    }

    async buscarPorMedico(idMedico, fechaInicio = null, fechaFin = null) {
        try {
            const where = { id_medico: idMedico };

            if (fechaInicio && fechaFin) {
                where.fecha = {
                    [Op.between]: [fechaInicio, fechaFin]
                };
            }

            return await Cita.findAll({
                where,
                include: [
                    {
                        model: Usuario,
                        as: 'paciente',
                        attributes: ['id', 'nombre', 'correo', 'telefono']
                    }
                ],
                order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
            });
        } catch (error) {
            console.error('❌ Error en CitaRepositorio.buscarPorMedico:', error);
            throw new Error('Error al buscar citas por médico.');
        }
    }

    async buscarPorPaciente(idPaciente) {
        try {
            return await Cita.findAll({
                where: { id_paciente: idPaciente },
                include: [
                    {
                        model: Usuario,
                        as: 'medico',
                        attributes: ['id', 'nombre', 'especialidad', 'correo']
                    }
                ],
                order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
            });
        } catch (error) {
            console.error('❌ Error en CitaRepositorio.buscarPorPaciente:', error);
            throw new Error('Error al buscar citas por paciente.');
        }
    }

    async buscarDisponibles(idMedico, fecha) {
        try {
            return await Cita.findAll({
                where: {
                    id_medico: idMedico,
                    fecha: fecha,
                    estado: 'disponible'
                },
                order: [['hora_inicio', 'ASC']]
            });
        } catch (error) {
            console.error('❌ Error en CitaRepositorio.buscarDisponibles:', error);
            throw new Error('Error al buscar citas disponibles.');
        }
    }

    async actualizarEstado(idCita, nuevoEstado, datosCita = {}) {
        try {
            const cita = await Cita.findByPk(idCita);
            if (!cita) {
                throw new Error('Cita no encontrada.');
            }

            return await cita.update({
                estado: nuevoEstado,
                ...datosCita
            });
        } catch (error) {
            console.error('❌ Error en CitaRepositorio.actualizarEstado:', error);
            throw new Error('Error al actualizar estado de la cita.');
        }
    }
}

module.exports = new CitaRepositorio();