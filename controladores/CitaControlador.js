// ============================================
// 📄 controladores/CitaControlador.js (CORREGIDO)
// ============================================
const citaServicio = require('../Servicios/CitaServicio');

class CitaControlador {

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

    async obtenerMisCitas(req, res) {
        try {
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

    // ✅ MÉTODO CORREGIDO: completarCita ya NO recibe notas obligatorias
    async completarCita(req, res) {
        try {
            const { idCita } = req.params;
            const { notas } = req.body;

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ CitaControlador.completarCita');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🆔 ID de cita (params):', idCita);
            console.log('📦 Body completo:', req.body);
            console.log('📝 Notas recibidas:', notas ? `${notas.length} caracteres` : 'NO SE ENVIARON NOTAS');

            // ✅ Completar la cita (las notas ya deben estar guardadas previamente)
            const citaCompletada = await citaServicio.completarCita(idCita, notas);

            console.log('✅ CitaControlador: Cita completada exitosamente');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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

    // ✅ MÉTODO PARA ACTUALIZAR NOTAS (SE USA ANTES DE COMPLETAR)
    async actualizarNotas(req, res) {
        try {
            const { idCita } = req.params;
            const { notas } = req.body;

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📝 CitaControlador.actualizarNotas');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🆔 ID de cita (params):', idCita);
            console.log('📦 Body completo:', req.body);
            console.log('📝 Notas recibidas:', notas ? `${notas.length} caracteres` : 'NULL/UNDEFINED');

            if (!notas) {
                console.log('⚠️ ADVERTENCIA CRÍTICA: req.body.notas es NULL o UNDEFINED');
                console.log('⚠️ Verificar que el frontend esté enviando el campo "notas"');
                return res.status(400).json({
                    exito: false,
                    mensaje: 'El campo "notas" es requerido'
                });
            }

            if (notas) {
                console.log('📄 Primeros 200 caracteres:');
                console.log(notas.substring(0, 200));
            }

            const citaActualizada = await citaServicio.actualizarNotas(idCita, notas);

            console.log('✅ CitaControlador: Respuesta exitosa');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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

    async obtenerMisExamenesLaboratorio(req, res) {
        try {
            const idPaciente = req.usuario.id;

            console.log(`🔬 Obteniendo exámenes de laboratorio del paciente ID: ${idPaciente}`);

            // Importar modelos necesarios
            const ExamenLaboratorio = require('../entidades/ExamenLaboratorio');
            const Autorizacion = require('../entidades/Autorizacion');
            const Usuario = require('../entidades/Usuarios');

            const examenes = await ExamenLaboratorio.findAll({
                include: [
                    {
                        model: Autorizacion,
                        as: 'autorizacion',
                        where: {
                            id_paciente: idPaciente,
                            tipo: 'examen'
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
                                attributes: ['id', 'nombre', 'correo']
                            }
                        ]
                    },
                    {
                        model: Usuario,
                        as: 'tecnico',
                        attributes: ['id', 'nombre']
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            console.log(`✅ Se encontraron ${examenes.length} exámenes para el paciente ${idPaciente}`);

            // Formatear datos
            const examenesFormateados = examenes.map(ex => {
                const exJSON = ex.toJSON();
                const autorizacion = exJSON.autorizacion || {};

                return {
                    id: exJSON.id,
                    descripcion: autorizacion.descripcion,
                    tipo: autorizacion.tipo,
                    justificacion: autorizacion.justificacion,
                    prioridad: autorizacion.prioridad,
                    estado: exJSON.estado,

                    // Datos de la muestra
                    tipoMuestra: exJSON.tipo_muestra,
                    codigoMuestra: exJSON.codigo_muestra,
                    fechaTomaMuestra: exJSON.fecha_toma_muestra,
                    condicionMuestra: exJSON.condicion_muestra,

                    // Datos del análisis
                    fechaInicioAnalisis: exJSON.fecha_inicio_analisis,
                    metodoAnalisis: exJSON.metodo_analisis,

                    // Resultados
                    resultado: exJSON.resultado,
                    observaciones: exJSON.observaciones,
                    estadoResultado: exJSON.estado_resultado,
                    fechaRealizacion: exJSON.fecha_realizacion,

                    // Fechas
                    fechaSolicitud: autorizacion.fecha_solicitud,

                    // Médico solicitante
                    medico: autorizacion.medico ? {
                        id: autorizacion.medico.id,
                        nombre: autorizacion.medico.nombre,
                        especialidad: autorizacion.medico.especialidad
                    } : null,

                    // Técnico de laboratorio
                    tecnico: exJSON.tecnico ? {
                        id: exJSON.tecnico.id,
                        nombre: exJSON.tecnico.nombre
                    } : null
                };
            });

            res.json({
                exito: true,
                total: examenesFormateados.length,
                datos: examenesFormateados
            });

        } catch (error) {
            console.error('❌ Error en CitaControlador.obtenerMisExamenesLaboratorio:', error);
            res.status(500).json({
                exito: false,
                mensaje: 'Error al obtener exámenes de laboratorio: ' + error.message
            });
        }
    }

}

module.exports = new CitaControlador();