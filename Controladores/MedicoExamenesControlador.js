// ============================================
// 📄 Controladores/MedicoExamenesControlador.js
// ============================================
const { Usuario, ExamenLaboratorio, Autorizacion, Cita } = require('../entidades/asociaciones');
const { Op } = require('sequelize');

class MedicoExamenesControlador {

    /**
     * Obtener información de un paciente y sus exámenes por documento
     * GET /api/medico/paciente-examenes/:documento
     */
    async obtenerPacienteYExamenes(req, res) {
        try {
            const { documento } = req.params;
            const medicoId = req.usuario.id;

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔍 Buscando paciente y exámenes');
            console.log(`📋 Documento: ${documento}`);
            console.log(`👨‍⚕️ Médico ID: ${medicoId}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // Buscar paciente por documento
            const paciente = await Usuario.findOne({
                where: {
                    identificacion: documento,
                    rol: 'paciente'
                },
                attributes: ['id', 'nombre', 'identificacion', 'correo', 'telefono', 'tipo_identificacion']
            });

            if (!paciente) {
                return res.status(404).json({
                    exito: false,
                    mensaje: 'Paciente no encontrado con ese documento'
                });
            }

            console.log('✅ Paciente encontrado:', paciente.nombre);

            // Obtener todos los exámenes del paciente
            const examenes = await ExamenLaboratorio.findAll({
                include: [
                    {
                        model: Autorizacion,
                        as: 'autorizacion',
                        required: true,
                        where: {
                            id_paciente: paciente.id
                        },
                        include: [
                            {
                                model: Usuario,
                                as: 'medico',
                                attributes: ['id', 'nombre', 'especialidad']
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
                        attributes: ['id', 'nombre'],
                        required: false
                    }
                ],
                order: [
                    ['created_at', 'DESC']  // Ordenar por fecha de creación del examen
                ]
            });

            console.log(`📊 Exámenes encontrados: ${examenes.length}`);

            // Mapear exámenes a formato frontend
            const examenesFormateados = examenes.map(examen => {
                const examenJSON = examen.toJSON();

                return {
                    id: examenJSON.id,
                    descripcion: examenJSON.descripcion || examenJSON.tipo || 'Examen de laboratorio',
                    codigoMuestra: examenJSON.codigo_muestra,
                    estado: examenJSON.estado,
                    tipo: examenJSON.tipo,

                    // Fechas
                    fechaSolicitud: examenJSON.fecha_solicitud || examenJSON.autorizacion?.fecha_solicitud,
                    fechaTomaMuestra: examenJSON.fecha_toma_muestra,
                    fechaInicioAnalisis: examenJSON.fecha_inicio_analisis,
                    fechaRealizacion: examenJSON.fecha_realizacion,

                    // Datos de la muestra
                    tipoMuestra: examenJSON.tipo_muestra,
                    condicionMuestra: examenJSON.condicion_muestra,
                    metodoAnalisis: examenJSON.metodo_analisis,

                    // Resultados
                    resultado: examenJSON.resultado,
                    estadoResultado: examenJSON.estado_resultado,
                    observaciones: examenJSON.observaciones,
                    justificacion: examenJSON.autorizacion?.justificacion,

                    // Médico solicitante
                    medico: examenJSON.autorizacion?.medico ? {
                        nombre: examenJSON.autorizacion.medico.nombre,
                        especialidad: examenJSON.autorizacion.medico.especialidad
                    } : null,

                    // Técnico
                    tecnico: examenJSON.tecnico ? {
                        nombre: examenJSON.tecnico.nombre
                    } : null,

                    // Prioridad
                    prioridad: examenJSON.prioridad || examenJSON.autorizacion?.prioridad
                };
            });

            return res.status(200).json({
                exito: true,
                mensaje: 'Información obtenida exitosamente',
                datos: {
                    paciente: {
                        id: paciente.id,
                        nombre: paciente.nombre,
                        identificacion: paciente.identificacion,
                        tipoIdentificacion: paciente.tipo_identificacion,
                        correo: paciente.correo,
                        telefono: paciente.telefono
                    },
                    examenes: examenesFormateados
                }
            });

        } catch (error) {
            console.error('❌ Error al obtener paciente y exámenes:', error);
            return res.status(500).json({
                exito: false,
                mensaje: 'Error al obtener la información: ' + error.message
            });
        }
    }

    /**
     * Descargar PDF de resultado de examen (para médicos)
     * GET /api/medico/examenes/:idExamen/descargar-pdf
     */
    async descargarResultadoPDF(req, res) {
        try {
            const { idExamen } = req.params;
            const medicoId = req.usuario.id;

            console.log('📄 Médico solicitando PDF de examen:', { idExamen, medicoId });

            // Verificar que el examen existe y obtener el paciente
            const examen = await ExamenLaboratorio.findOne({
                where: { id: idExamen },
                include: [
                    {
                        model: Autorizacion,
                        as: 'autorizacion',
                        required: true,
                        include: [
                            {
                                model: Usuario,
                                as: 'paciente',
                                attributes: ['id']
                            }
                        ]
                    }
                ]
            });

            if (!examen) {
                return res.status(404).json({
                    exito: false,
                    mensaje: 'Examen no encontrado'
                });
            }

            // Obtener el paciente completo
            const paciente = await Usuario.findByPk(examen.autorizacion.id_paciente);

            if (!paciente) {
                return res.status(404).json({
                    exito: false,
                    mensaje: 'Paciente no encontrado'
                });
            }

            // Usar el mismo controlador de PDF pero con datos del paciente
            const ResultadosExamenesPDFControlador = require('./ResultadosExamenesPDFControlador');

            // Temporalmente modificar req.usuario para que sea el paciente
            const usuarioOriginal = req.usuario;
            req.usuario = paciente;

            // Llamar al generador de PDF
            await ResultadosExamenesPDFControlador.generarResultadoPDF(req, res);

            // Restaurar usuario original
            req.usuario = usuarioOriginal;

        } catch (error) {
            console.error('❌ Error al generar PDF para médico:', error);
            return res.status(500).json({
                exito: false,
                mensaje: 'Error al generar el PDF: ' + error.message
            });
        }
    }
}

module.exports = new MedicoExamenesControlador();