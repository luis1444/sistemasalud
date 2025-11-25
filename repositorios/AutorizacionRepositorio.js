// ============================================
//  repositorios/AutorizacionRepositorio.js
// ============================================
const Autorizacion = require('../entidades/Autorizacion');
const Usuario = require('../entidades/Usuarios');
const Cita = require('../entidades/Cita');
const { Op } = require('sequelize');

class AutorizacionRepositorio {

    async crear(datosAutorizacion) {
        try {
            return await Autorizacion.create(datosAutorizacion);
        } catch (error) {
            console.error('❌ Error en AutorizacionRepositorio.crear:', error);
            throw new Error('Error al crear la autorización.');
        }
    }

    async buscarPorId(idAutorizacion) {
        try {
            return await Autorizacion.findByPk(idAutorizacion, {
                include: [
                    {
                        model: Usuario,
                        as: 'medico',
                        attributes: ['id', 'nombre', 'especialidad']
                    },
                    {
                        model: Usuario,
                        as: 'paciente',
                        // ✅ REMOVIDO 'cedula' porque no existe en la tabla usuarios
                        attributes: ['id', 'nombre', 'correo', 'telefono']
                    },
                    {
                        model: Cita,
                        as: 'cita',
                        attributes: ['id', 'fecha', 'hora_inicio', 'motivo_consulta']
                    }
                ]
            });
        } catch (error) {
            console.error('❌ Error en AutorizacionRepositorio.buscarPorId:', error);
            throw new Error('Error al buscar autorización por ID.');
        }
    }

    async buscarPorEstado(estado) {
        try {
            return await Autorizacion.findAll({
                where: { estado },
                include: [
                    {
                        model: Usuario,
                        as: 'medico',
                        attributes: ['id', 'nombre', 'especialidad']
                    },
                    {
                        model: Usuario,
                        as: 'paciente',
                        // ✅ REMOVIDO 'cedula' porque no existe en la tabla usuarios
                        attributes: ['id', 'nombre', 'correo', 'telefono']
                    },
                    {
                        model: Cita,
                        as: 'cita',
                        attributes: ['id', 'fecha', 'hora_inicio', 'motivo_consulta']
                    }
                ],
                order: [
                    ['prioridad', 'DESC'],
                    ['fecha_solicitud', 'DESC']
                ]
            });
        } catch (error) {
            console.error('❌ Error en AutorizacionRepositorio.buscarPorEstado:', error);
            throw new Error('Error al buscar autorizaciones por estado.');
        }
    }

    async buscarPorMedico(idMedico, filtros = {}) {
        try {
            const where = { id_medico: idMedico };

            if (filtros.estado) {
                where.estado = filtros.estado;
            }

            if (filtros.tipo) {
                where.tipo = filtros.tipo;
            }

            return await Autorizacion.findAll({
                where,
                include: [
                    {
                        model: Usuario,
                        as: 'paciente',
                        // ✅ REMOVIDO 'cedula' porque no existe en la tabla usuarios
                        attributes: ['id', 'nombre', 'correo', 'telefono']
                    },
                    {
                        model: Cita,
                        as: 'cita',
                        attributes: ['id', 'fecha', 'hora_inicio']
                    }
                ],
                order: [['fecha_solicitud', 'DESC']]
            });
        } catch (error) {
            console.error('❌ Error en AutorizacionRepositorio.buscarPorMedico:', error);
            throw new Error('Error al buscar autorizaciones por médico.');
        }
    }

    async buscarPorPaciente(idPaciente) {
        try {
            return await Autorizacion.findAll({
                where: { id_paciente: idPaciente },
                include: [
                    {
                        model: Usuario,
                        as: 'medico',
                        attributes: ['id', 'nombre', 'especialidad']
                    },
                    {
                        model: Cita,
                        as: 'cita',
                        attributes: ['id', 'fecha', 'hora_inicio', 'motivo_consulta']
                    }
                ],
                order: [['fecha_solicitud', 'DESC']]
            });
        } catch (error) {
            console.error('❌ Error en AutorizacionRepositorio.buscarPorPaciente:', error);
            throw new Error('Error al buscar autorizaciones por paciente.');
        }
    }

    async actualizarEstado(idAutorizacion, nuevoEstado, datosAdicionales = {}) {
        try {
            const autorizacion = await Autorizacion.findByPk(idAutorizacion);

            if (!autorizacion) {
                throw new Error('Autorización no encontrada.');
            }

            const updateData = {
                estado: nuevoEstado,
                fecha_respuesta: new Date(),
                ...datosAdicionales
            };

            return await autorizacion.update(updateData);
        } catch (error) {
            console.error('❌ Error en AutorizacionRepositorio.actualizarEstado:', error);
            throw new Error('Error al actualizar estado de la autorización.');
        }
    }

    async obtenerEstadisticas() {
        try {
            const [pendientes, aprobadas, rechazadas, porTipo, porPrioridad] = await Promise.all([
                Autorizacion.count({ where: { estado: 'pendiente' } }),
                Autorizacion.count({ where: { estado: 'aprobada' } }),
                Autorizacion.count({ where: { estado: 'rechazada' } }),
                Autorizacion.findAll({
                    attributes: [
                        'tipo',
                        [Autorizacion.sequelize.fn('COUNT', '*'), 'total']
                    ],
                    group: ['tipo']
                }),
                Autorizacion.findAll({
                    attributes: [
                        'prioridad',
                        [Autorizacion.sequelize.fn('COUNT', '*'), 'total']
                    ],
                    where: { estado: 'pendiente' },
                    group: ['prioridad']
                })
            ]);

            return {
                totales: {
                    pendientes,
                    aprobadas,
                    rechazadas
                },
                porTipo: porTipo.map(item => ({
                    tipo: item.tipo,
                    total: parseInt(item.dataValues.total)
                })),
                porPrioridad: porPrioridad.map(item => ({
                    prioridad: item.prioridad,
                    total: parseInt(item.dataValues.total)
                }))
            };
        } catch (error) {
            console.error('❌ Error en AutorizacionRepositorio.obtenerEstadisticas:', error);
            throw new Error('Error al obtener estadísticas.');
        }
    }
}

module.exports = new AutorizacionRepositorio();