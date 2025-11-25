// ============================================
// 📄 repositorios/CitaRepositorio.js (COMPLETO CON DEBUGGING)
// ============================================
const Cita = require('../entidades/Cita');
const Usuario = require('../entidades/Usuarios');
const { Op } = require('sequelize');

class CitaRepositorio {

    async crearMultiples(citas) {
        try {
            return await Cita.bulkCreate(citas, {
                ignoreDuplicates: true
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
            const where = {};

            if (idMedico) {
                where.id_medico = idMedico;
            }

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
                        attributes: ['id', 'nombre', 'correo', 'telefono'],
                        required: false
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
            console.log(`🔍 CitaRepositorio: Buscando citas del paciente ${idPaciente}`);

            const citas = await Cita.findAll({
                where: { id_paciente: idPaciente },
                include: [
                    {
                        model: Usuario,
                        as: 'medico',
                        attributes: ['id', 'nombre', 'especialidad', 'correo']
                    }
                ],
                order: [['fecha', 'DESC'], ['hora_inicio', 'DESC']]
            });

            console.log(`✅ CitaRepositorio: Se encontraron ${citas.length} citas`);

            // ✅ DEBUGGING: Log detallado de las notas
            citas.forEach((cita, index) => {
                const citaJSON = cita.toJSON();
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`📋 Cita ${index + 1} (ID: ${citaJSON.id})`);
                console.log(`   📅 Fecha: ${citaJSON.fecha}`);
                console.log(`   🏥 Estado: ${citaJSON.estado}`);
                console.log(`   📝 Tiene notas: ${citaJSON.notas ? 'SÍ' : 'NO'}`);
                if (citaJSON.notas) {
                    console.log(`   📏 Longitud notas: ${citaJSON.notas.length} caracteres`);
                    console.log(`   📄 Primeros 150 chars de notas:`);
                    console.log(`   ${citaJSON.notas.substring(0, 150)}...`);
                } else {
                    console.log(`   ⚠️ Campo notas está: ${citaJSON.notas === null ? 'NULL' : 'VACÍO'}`);
                }
            });
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

            return citas;
        } catch (error) {
            console.error('❌ Error en CitaRepositorio.buscarPorPaciente:', error);
            throw new Error('Error al buscar citas por paciente.');
        }
    }

    async buscarDisponibles(idMedico, fecha) {
        try {
            console.log(`🔍 Buscando citas disponibles - Médico: ${idMedico}, Fecha: ${fecha}`);

            const citas = await Cita.findAll({
                where: {
                    id_medico: idMedico,
                    fecha: fecha,
                    estado: 'disponible'
                },
                order: [['hora_inicio', 'ASC']]
            });

            console.log(`📊 Citas encontradas: ${citas.length}`);

            if (citas.length > 0) {
                console.log('📝 Primera cita (raw):', JSON.stringify(citas[0], null, 2));
                const primeraJSON = citas[0].toJSON();
                console.log('📝 Primera cita (JSON):', primeraJSON);
                console.log('⏰ Campos de tiempo:', {
                    hora_inicio: primeraJSON.hora_inicio,
                    hora_fin: primeraJSON.hora_fin
                });
            }

            return citas;
        } catch (error) {
            console.error('❌ Error en CitaRepositorio.buscarDisponibles:', error);
            throw new Error('Error al buscar citas disponibles.');
        }
    }

    async buscarPorId(idCita) {
        try {
            return await Cita.findByPk(idCita, {
                include: [
                    {
                        model: Usuario,
                        as: 'paciente',
                        attributes: ['id', 'nombre', 'correo', 'telefono'],
                        required: false
                    },
                    {
                        model: Usuario,
                        as: 'medico',
                        attributes: ['id', 'nombre', 'especialidad', 'correo']
                    }
                ]
            });
        } catch (error) {
            console.error('❌ Error en CitaRepositorio.buscarPorId:', error);
            throw new Error('Error al buscar cita por ID.');
        }
    }

    async actualizarEstado(idCita, nuevoEstado, datosCita = {}) {
        try {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔄 CitaRepositorio.actualizarEstado');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📝 ID de cita:', idCita);
            console.log('📝 Nuevo estado:', nuevoEstado);
            console.log('📝 Datos adicionales:', Object.keys(datosCita));

            const cita = await Cita.findByPk(idCita);

            if (!cita) {
                throw new Error('Cita no encontrada.');
            }

            console.log('📋 Cita encontrada - Estado actual:', cita.estado);
            console.log('📋 Notas actuales:', cita.notas ? `${cita.notas.length} caracteres` : 'NULL/VACÍO');

            const updateData = { ...datosCita };
            if (nuevoEstado) {
                updateData.estado = nuevoEstado;
            }

            console.log('📦 Datos que se van a actualizar:', Object.keys(updateData));

            if (updateData.notas) {
                console.log('📝 Longitud de las nuevas notas:', updateData.notas.length);
                console.log('📝 Primeros 200 caracteres de las nuevas notas:');
                console.log(updateData.notas.substring(0, 200));
            }

            // ✅ ACTUALIZAR LA CITA
            const citaActualizada = await cita.update(updateData);

            console.log('✅ Cita actualizada en BD');
            console.log('🔍 Verificando actualización...');

            // ✅ RECARGAR desde la BD para verificar
            await citaActualizada.reload();

            console.log('   Estado después de actualizar:', citaActualizada.estado);
            console.log('   Notas después de actualizar:', citaActualizada.notas ? `${citaActualizada.notas.length} chars` : 'NULL');

            if (citaActualizada.notas) {
                console.log('   📄 Preview de notas guardadas:');
                console.log('   ' + citaActualizada.notas.substring(0, 150));
            } else {
                console.log('   ⚠️ ¡ADVERTENCIA! Las notas NO se guardaron');
            }

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            return citaActualizada;
        } catch (error) {
            console.error('❌ Error en CitaRepositorio.actualizarEstado:', error);
            throw new Error('Error al actualizar estado de la cita.');
        }
    }
}

module.exports = new CitaRepositorio();