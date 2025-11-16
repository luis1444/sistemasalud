
// ============================================
// Repositorios/LaboratorioRepositorio.js
// ============================================
const ExamenLaboratorio = require('../entidades/ExamenLaboratorio');
const Autorizacion = require('../entidades/Autorizacion');
const Usuario = require('../entidades/Usuarios');
const Cita = require('../entidades/Cita');
const { Op } = require('sequelize');

class LaboratorioRepositorio {

    async crearExamenLaboratorio(idAutorizacion) {
        try {
            return await ExamenLaboratorio.create({
                id_autorizacion: idAutorizacion,
                estado: 'pendiente'
            });
        } catch (error) {
            console.error('❌ Error en LaboratorioRepositorio.crearExamenLaboratorio:', error);
            throw new Error('Error al crear el examen de laboratorio.');
        }
    }

    async obtenerExamenesPendientes() {
        try {
            return await ExamenLaboratorio.findAll({
                where: { estado: 'pendiente' },
                include: [
                    {
                        model: Autorizacion,
                        as: 'autorizacion',
                        where: {
                            tipo: 'examen',
                            estado: 'aprobada'
                        },
                        include: [
                            {
                                model: Usuario,
                                as: 'medico',
                                attributes: ['id', 'nombre', 'especialidad']
                            },
                            {
                                model: Usuario,
                                as: 'paciente',
                                attributes: ['id', 'nombre', 'correo', 'telefono']
                            },
                            {
                                model: Cita,
                                as: 'cita',
                                attributes: ['id', 'fecha', 'hora_inicio']
                            }
                        ]
                    }
                ],
                order: [
                    [{ model: Autorizacion, as: 'autorizacion' }, 'prioridad', 'DESC'],
                    [{ model: Autorizacion, as: 'autorizacion' }, 'fecha_solicitud', 'ASC']
                ]
            });
        } catch (error) {
            console.error('❌ Error en LaboratorioRepositorio.obtenerExamenesPendientes:', error);
            throw new Error('Error al obtener exámenes pendientes.');
        }
    }

    async obtenerExamenesEnProceso(idTecnico = null) {
        try {
            const where = { estado: 'en-proceso' };
            if (idTecnico) {
                where.id_tecnico = idTecnico;
            }

            return await ExamenLaboratorio.findAll({
                where,
                include: [
                    {
                        model: Autorizacion,
                        as: 'autorizacion',
                        include: [
                            {
                                model: Usuario,
                                as: 'medico',
                                attributes: ['id', 'nombre', 'especialidad']
                            },
                            {
                                model: Usuario,
                                as: 'paciente',
                                attributes: ['id', 'nombre', 'correo', 'telefono']
                            },
                            {
                                model: Cita,
                                as: 'cita',
                                attributes: ['id', 'fecha']
                            }
                        ]
                    }
                ],
                order: [['fecha_inicio', 'ASC']]
            });
        } catch (error) {
            console.error('❌ Error en LaboratorioRepositorio.obtenerExamenesEnProceso:', error);
            throw new Error('Error al obtener exámenes en proceso.');
        }
    }

    async obtenerHistorial(filtros = {}) {
        try {
            const where = { estado: 'completado' };

            if (filtros.periodo) {
                const ahora = new Date();
                let fechaInicio;

                switch (filtros.periodo) {
                    case 'hoy':
                        fechaInicio = new Date(ahora.setHours(0, 0, 0, 0));
                        break;
                    case 'semana':
                        fechaInicio = new Date(ahora.setDate(ahora.getDate() - 7));
                        break;
                    case 'mes':
                        fechaInicio = new Date(ahora.setMonth(ahora.getMonth() - 1));
                        break;
                    default:
                        fechaInicio = null;
                }

                if (fechaInicio) {
                    where.fecha_realizacion = {
                        [Op.gte]: fechaInicio
                    };
                }
            }

            if (filtros.idTecnico) {
                where.id_tecnico = filtros.idTecnico;
            }

            return await ExamenLaboratorio.findAll({
                where,
                include: [
                    {
                        model: Autorizacion,
                        as: 'autorizacion',
                        include: [
                            {
                                model: Usuario,
                                as: 'medico',
                                attributes: ['id', 'nombre', 'especialidad']
                            },
                            {
                                model: Usuario,
                                as: 'paciente',
                                attributes: ['id', 'nombre', 'correo', 'telefono']
                            }
                        ]
                    },
                    {
                        model: Usuario,
                        as: 'tecnico',
                        attributes: ['id', 'nombre']
                    }
                ],
                order: [['fecha_realizacion', 'DESC']]
            });
        } catch (error) {
            console.error('❌ Error en LaboratorioRepositorio.obtenerHistorial:', error);
            throw new Error('Error al obtener el historial.');
        }
    }

    async obtenerPorId(idExamen) {
        try {
            return await ExamenLaboratorio.findByPk(idExamen, {
                include: [
                    {
                        model: Autorizacion,
                        as: 'autorizacion',
                        include: [
                            {
                                model: Usuario,
                                as: 'medico',
                                attributes: ['id', 'nombre', 'especialidad']
                            },
                            {
                                model: Usuario,
                                as: 'paciente',
                                attributes: ['id', 'nombre', 'correo', 'telefono']
                            },
                            {
                                model: Cita,
                                as: 'cita',
                                attributes: ['id', 'fecha', 'motivo_consulta']
                            }
                        ]
                    },
                    {
                        model: Usuario,
                        as: 'tecnico',
                        attributes: ['id', 'nombre']
                    }
                ]
            });
        } catch (error) {
            console.error('❌ Error en LaboratorioRepositorio.obtenerPorId:', error);
            throw new Error('Error al obtener el examen.');
        }
    }

    async iniciarProcesamiento(idExamen, idTecnico) {
        try {
            const examen = await ExamenLaboratorio.findByPk(idExamen);

            if (!examen) {
                throw new Error('Examen no encontrado.');
            }

            if (examen.estado !== 'pendiente') {
                throw new Error('El examen no está en estado pendiente.');
            }

            return await examen.update({
                estado: 'en-proceso',
                id_tecnico: idTecnico,
                fecha_inicio: new Date()
            });
        } catch (error) {
            console.error('❌ Error en LaboratorioRepositorio.iniciarProcesamiento:', error);
            throw error;
        }
    }

    async completarExamen(idExamen, datos) {
        try {
            const examen = await ExamenLaboratorio.findByPk(idExamen);

            if (!examen) {
                throw new Error('Examen no encontrado.');
            }

            if (examen.estado !== 'en-proceso') {
                throw new Error('El examen debe estar en estado "en-proceso" para completarse.');
            }

            return await examen.update({
                estado: 'completado',
                resultado: datos.resultado,
                observaciones: datos.observaciones || null,
                estado_resultado: datos.estadoResultado,
                fecha_realizacion: datos.fechaRealizacion || new Date()
            });
        } catch (error) {
            console.error('❌ Error en LaboratorioRepositorio.completarExamen:', error);
            throw error;
        }
    }

    async obtenerEstadisticas(idTecnico = null) {
        try {
            const whereCompleto = { estado: 'completado' };
            if (idTecnico) {
                whereCompleto.id_tecnico = idTecnico;
            }

            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            const [pendientes, enProceso, completadosHoy, totalMes] = await Promise.all([
                ExamenLaboratorio.count({ where: { estado: 'pendiente' } }),
                ExamenLaboratorio.count({
                    where: {
                        estado: 'en-proceso',
                        ...(idTecnico ? { id_tecnico: idTecnico } : {})
                    }
                }),
                ExamenLaboratorio.count({
                    where: {
                        ...whereCompleto,
                        fecha_realizacion: {
                            [Op.gte]: hoy
                        }
                    }
                }),
                ExamenLaboratorio.count({
                    where: {
                        ...whereCompleto,
                        fecha_realizacion: {
                            [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1))
                        }
                    }
                })
            ]);

            return {
                pendientes,
                enProceso,
                completadosHoy,
                totalMes
            };
        } catch (error) {
            console.error('❌ Error en LaboratorioRepositorio.obtenerEstadisticas:', error);
            throw new Error('Error al obtener estadísticas.');
        }
    }
}

module.exports = new LaboratorioRepositorio();
