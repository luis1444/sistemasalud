// ============================================
// 📄 controladores/ResultadosExamenesPDFControlador.js
// ============================================
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { ExamenLaboratorio, Usuario, Cita, Autorizacion } = require('../entidades/asociaciones');

class ResultadosExamenesPDFControlador {

    // Constructor para vincular métodos
    constructor() {
        this.generarResultadoPDF = this.generarResultadoPDF.bind(this);
        this.obtenerExamenPorId = this.obtenerExamenPorId.bind(this);
        this.formatearFechaCompleta = this.formatearFechaCompleta.bind(this);
    }

    async generarResultadoPDF(req, res) {
        let pdfStarted = false;
        let doc;

        try {
            const { idExamen } = req.params;

            // Obtener datos del usuario autenticado
            const usuarioRaw = req.usuario;
            const usuarioJSON = usuarioRaw.toJSON ? usuarioRaw.toJSON() : usuarioRaw;

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔍 Generando PDF de resultado de examen');
            console.log(`📋 ID Examen: ${idExamen}`);
            console.log(`👤 ID Paciente: ${usuarioJSON.id}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // Obtener datos del examen desde la base de datos
            const examen = await this.obtenerExamenPorId(idExamen, usuarioJSON.id);

            if (!examen) {
                return res.status(404).json({
                    exito: false,
                    mensaje: 'Examen no encontrado o no pertenece al paciente'
                });
            }

            // Verificar que el examen esté completado
            if (examen.estado !== 'completado') {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'El examen aún no está completado. No hay resultados disponibles.'
                });
            }

            // Extraer datos del paciente
            const nombre = usuarioJSON.nombre || 'No registrado';
            const identificacion = usuarioJSON.identificacion || 'No registrada';
            const tipoIdRaw = usuarioJSON.tipo_identificacion || '';
            const tipoIdentificacion = tipoIdRaw ? tipoIdRaw.replace(/_/g, ' ').toUpperCase() : 'No especificado';
            const correo = usuarioJSON.correo || 'No registrado';
            const telefono = usuarioJSON.telefono || 'No registrado';

            console.log('✅ Datos del examen obtenidos:', {
                descripcion: examen.descripcion,
                estado: examen.estado,
                codigoMuestra: examen.codigoMuestra
            });

            // ============================================
            // CREAR DOCUMENTO PDF
            // ============================================
            doc = new PDFDocument({
                size: 'LETTER',
                margins: { top: 60, bottom: 60, left: 50, right: 50 }
            });

            // Configurar headers
            const nombreArchivo = `Resultado_${examen.codigoMuestra || examen.id}_${examen.descripcion.replace(/\s+/g, '_')}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);

            doc.pipe(res);
            pdfStarted = true;

            // ============================================
            // ENCABEZADO CON LOGO
            // ============================================
            const logoPath = path.join(__dirname, '..', 'Public', 'images', 'logo.png');

            if (fs.existsSync(logoPath)) {
                try {
                    doc.image(logoPath, 50, 50, { width: 60 });
                } catch (logoError) {
                    console.warn('⚠️ No se pudo cargar el logo');
                }
            }

            doc.fontSize(24)
                .fillColor('#0077b6')
                .font('Helvetica-Bold')
                .text('RESULTADOS DE LABORATORIO', 130, 60, { align: 'left' });

            doc.fontSize(11)
                .fillColor('#666')
                .font('Helvetica')
                .text('VITAL+ Sistema de Gestión Médica', 130, 90, { align: 'left' });

            doc.moveDown(3);

            // ============================================
            // INFORMACIÓN DEL PACIENTE
            // ============================================
            doc.fontSize(14)
                .fillColor('#0077b6')
                .font('Helvetica-Bold')
                .text('INFORMACIÓN DEL PACIENTE', 50, doc.y)
                .moveDown(0.5);

            const infoBoxY = doc.y;
            doc.rect(50, infoBoxY, 512, 110)
                .fillAndStroke('#f0f7fb', '#0077b6');

            doc.fontSize(10)
                .fillColor('#333')
                .font('Helvetica');

            let currentY = infoBoxY + 15;
            const col1 = 65;
            const col2 = 310;

            // Fila 1
            doc.font('Helvetica-Bold').text('Nombre Completo:', col1, currentY);
            doc.font('Helvetica').text(nombre, col1, currentY + 14, { width: 230 });

            doc.font('Helvetica-Bold').text('Identificación:', col2, currentY);
            doc.font('Helvetica').text(`${tipoIdentificacion} ${identificacion}`, col2, currentY + 14, { width: 230 });

            // Fila 2
            currentY += 35;
            doc.font('Helvetica-Bold').text('Correo Electrónico:', col1, currentY);
            doc.font('Helvetica').text(correo, col1, currentY + 14, { width: 230 });

            doc.font('Helvetica-Bold').text('Teléfono:', col2, currentY);
            doc.font('Helvetica').text(telefono, col2, currentY + 14, { width: 230 });

            // Fila 3
            currentY += 35;
            doc.font('Helvetica-Bold').text('Fecha de Generación:', col1, currentY);
            doc.font('Helvetica').text(new Date().toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }), col1, currentY + 14, { width: 450 });

            doc.y = infoBoxY + 120;
            doc.moveDown(1.5);

            // ============================================
            // INFORMACIÓN DEL EXAMEN
            // ============================================
            doc.fontSize(14)
                .fillColor('#0077b6')
                .font('Helvetica-Bold')
                .text('INFORMACIÓN DEL EXAMEN', 50, doc.y)
                .moveDown(0.5);

            const examenBoxY = doc.y;
            const examenBoxHeight = 135;
            doc.rect(50, examenBoxY, 512, examenBoxHeight)
                .fillAndStroke('#fff9e6', '#ffc107');

            currentY = examenBoxY + 15;

            doc.fontSize(10).fillColor('#333');

            doc.font('Helvetica-Bold').text('Tipo de Examen:', col1, currentY);
            doc.font('Helvetica').text(examen.descripcion, col1, currentY + 14, { width: 230 });

            doc.font('Helvetica-Bold').text('Código de Muestra:', col2, currentY);
            doc.font('Helvetica').text(examen.codigoMuestra || 'N/A', col2, currentY + 14, { width: 230 });

            currentY += 35;
            doc.font('Helvetica-Bold').text('Fecha de Solicitud:', col1, currentY);
            doc.font('Helvetica').text(this.formatearFechaCompleta(examen.fechaSolicitud), col1, currentY + 14, { width: 230 });

            doc.font('Helvetica-Bold').text('Tipo de Muestra:', col2, currentY);
            doc.font('Helvetica').text(examen.tipoMuestra || 'N/A', col2, currentY + 14, { width: 230 });

            currentY += 35;
            doc.font('Helvetica-Bold').text('Médico Solicitante:', col1, currentY);
            doc.font('Helvetica').text(examen.medicoNombre || 'No registrado', col1, currentY + 14, { width: 230 });

            if (examen.especialidad) {
                doc.fontSize(9).fillColor('#666')
                    .text(examen.especialidad, col1, currentY + 28, { width: 230 });
            }

            doc.fontSize(10).fillColor('#333');
            doc.font('Helvetica-Bold').text('Técnico Responsable:', col2, currentY);
            doc.font('Helvetica').text(examen.tecnicoNombre || 'No asignado', col2, currentY + 14, { width: 230 });

            doc.y = examenBoxY + examenBoxHeight + 10;
            doc.moveDown(1.5);

            // ============================================
            // DATOS DE LA MUESTRA Y ANÁLISIS
            // ============================================
            doc.fontSize(14)
                .fillColor('#0077b6')
                .font('Helvetica-Bold')
                .text('DATOS DE LA MUESTRA Y ANÁLISIS', 50, doc.y)
                .moveDown(0.5);

            const muestraBoxY = doc.y;
            doc.rect(50, muestraBoxY, 512, 100)
                .fillAndStroke('#f0f7fb', '#0077b6');

            currentY = muestraBoxY + 15;

            doc.fontSize(10).fillColor('#333');

            doc.font('Helvetica-Bold').text('Fecha de Toma de Muestra:', col1, currentY);
            doc.font('Helvetica').text(this.formatearFechaCompleta(examen.fechaTomaMuestra), col1, currentY + 14, { width: 230 });

            doc.font('Helvetica-Bold').text('Condición de la Muestra:', col2, currentY);
            doc.font('Helvetica').text(examen.condicionMuestra || 'Normal', col2, currentY + 14, { width: 230 });

            currentY += 35;
            doc.font('Helvetica-Bold').text('Fecha de Inicio de Análisis:', col1, currentY);
            doc.font('Helvetica').text(this.formatearFechaCompleta(examen.fechaInicioAnalisis), col1, currentY + 14, { width: 230 });

            doc.font('Helvetica-Bold').text('Método de Análisis:', col2, currentY);
            doc.font('Helvetica').text(examen.metodoAnalisis || 'Estándar', col2, currentY + 14, { width: 230 });

            currentY += 35;
            doc.font('Helvetica-Bold').text('Fecha de Finalización:', col1, currentY);
            doc.font('Helvetica').text(this.formatearFechaCompleta(examen.fechaRealizacion), col1, currentY + 14, { width: 450 });

            doc.y = muestraBoxY + 110;
            doc.moveDown(2);

            // ============================================
            // RESULTADOS DEL EXAMEN
            // ============================================
            doc.fontSize(16)
                .fillColor('#0077b6')
                .font('Helvetica-Bold')
                .text('RESULTADOS DEL EXAMEN', 50, doc.y, { align: 'center' })
                .moveDown(1);

            // Estado del resultado
            if (examen.estadoResultado) {
                const estadoColors = {
                    'normal': { bg: '#d4edda', border: '#28a745', text: '✅ NORMAL' },
                    'anormal': { bg: '#fff3cd', border: '#ffc107', text: '⚠️ ANORMAL' },
                    'critico': { bg: '#f8d7da', border: '#dc3545', text: '🚨 CRÍTICO' }
                };

                const estadoConfig = estadoColors[examen.estadoResultado] || estadoColors['normal'];
                const estadoBadgeY = doc.y;

                doc.rect(200, estadoBadgeY, 162, 30)
                    .fillAndStroke(estadoConfig.bg, estadoConfig.border);

                doc.fontSize(14)
                    .fillColor(estadoConfig.border)
                    .font('Helvetica-Bold')
                    .text(estadoConfig.text, 200, estadoBadgeY + 8, {
                        width: 162,
                        align: 'center'
                    });

                doc.y = estadoBadgeY + 40;
            }

            // Contenido del resultado (sin caja fija, permite expansión)
            doc.fontSize(11)
                .fillColor('#333')
                .font('Helvetica');

            // Verificar si hay espacio suficiente, sino añadir página
            if (doc.y > 650) {
                doc.addPage();
            }

            const resultStartY = doc.y;

            // Dibujar borde superior
            doc.rect(50, resultStartY, 512, 5)
                .fillAndStroke('#0077b6', '#0077b6');

            doc.y = resultStartY + 15;

            // Escribir el texto del resultado (se expande automáticamente)
            doc.text(examen.resultado || 'Sin resultados disponibles', 65, doc.y, {
                width: 482,
                align: 'justify',
                lineGap: 3
            });

            // Guardar posición final del texto
            const resultEndY = doc.y + 10;

            // Dibujar borde lateral izquierdo
            doc.rect(50, resultStartY, 5, resultEndY - resultStartY)
                .fillAndStroke('#0077b6', '#0077b6');

            // Dibujar borde lateral derecho
            doc.rect(557, resultStartY, 5, resultEndY - resultStartY)
                .fillAndStroke('#0077b6', '#0077b6');

            // Dibujar borde inferior
            doc.rect(50, resultEndY, 512, 5)
                .fillAndStroke('#0077b6', '#0077b6');

            doc.y = resultEndY + 15;
            doc.moveDown(1);

            // ============================================
            // OBSERVACIONES TÉCNICAS
            // ============================================
            if (examen.observaciones) {
                doc.fontSize(13)
                    .fillColor('#0077b6')
                    .font('Helvetica-Bold')
                    .text('OBSERVACIONES TÉCNICAS', 50, doc.y)
                    .moveDown(0.5);

                const obsBoxY = doc.y;
                doc.rect(50, obsBoxY, 512, 80)
                    .fillAndStroke('#f8f9fa', '#6c757d');

                doc.fontSize(10)
                    .fillColor('#333')
                    .font('Helvetica')
                    .text(examen.observaciones, 65, obsBoxY + 15, {
                        width: 482,
                        align: 'justify'
                    });

                doc.y = obsBoxY + 90;
            }

            // ============================================
            // JUSTIFICACIÓN MÉDICA
            // ============================================
            if (examen.justificacion) {
                doc.moveDown(1);

                doc.fontSize(13)
                    .fillColor('#0077b6')
                    .font('Helvetica-Bold')
                    .text('JUSTIFICACIÓN MÉDICA', 50, doc.y)
                    .moveDown(0.5);

                doc.fontSize(10)
                    .fillColor('#333')
                    .font('Helvetica')
                    .text(examen.justificacion, 50, doc.y, {
                        width: 512,
                        align: 'justify'
                    });
            }

            // ============================================
            // PIE DE PÁGINA
            // ============================================
            const addFooter = () => {
                doc.fontSize(8)
                    .fillColor('#999')
                    .font('Helvetica')
                    .text(
                        'Este documento es un resultado médico confidencial generado por VITAL+ Sistema de Gestión Médica',
                        50,
                        doc.page.height - 50,
                        { align: 'center', width: 512 }
                    );
            };

            addFooter();

            doc.on('pageAdded', addFooter);

            doc.end();
            console.log('✅ PDF de resultado generado exitosamente');

        } catch (error) {
            console.error('❌ Error al generar PDF de resultado:', error);
            console.error('Stack:', error.stack);

            if (pdfStarted) {
                if (doc && !doc.ended) {
                    try {
                        doc.end();
                    } catch (e) {
                        res.end();
                    }
                }
            } else {
                res.status(500).json({
                    exito: false,
                    mensaje: 'Error al generar el PDF: ' + error.message
                });
            }
        }
    }

    // ============================================
    // MÉTODOS AUXILIARES
    // ============================================

    async obtenerExamenPorId(idExamen, idPaciente) {
        try {
            console.log('🔍 Buscando examen:', { idExamen, idPaciente });

            // Consulta con Sequelize usando las asociaciones definidas
            const examen = await ExamenLaboratorio.findOne({
                where: {
                    id: idExamen
                },
                include: [
                    {
                        model: Autorizacion,
                        as: 'autorizacion',
                        required: true,
                        where: {
                            id_paciente: idPaciente // Verificar que el examen pertenezca al paciente
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
                                attributes: ['id', 'nombre', 'identificacion']
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
                ]
            });

            if (!examen) {
                console.log('❌ Examen no encontrado o no pertenece al paciente');
                return null;
            }

            // Convertir a JSON
            const examenJSON = examen.toJSON();

            console.log('✅ Examen encontrado:', examenJSON);

            // Mapear campos para coincidir con lo que espera el PDF
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

                // Médico (desde la autorización)
                medicoNombre: examenJSON.autorizacion?.medico?.nombre || 'No registrado',
                especialidad: examenJSON.autorizacion?.medico?.especialidad,

                // Técnico (desde la relación directa)
                tecnicoNombre: examenJSON.tecnico?.nombre || 'No asignado',

                // Prioridad
                prioridad: examenJSON.prioridad || examenJSON.autorizacion?.prioridad
            };

        } catch (error) {
            console.error('❌ Error al obtener examen:', error);
            console.error('Stack completo:', error.stack);
            throw error;
        }
    }

    formatearFechaCompleta(fecha) {
        if (!fecha) return 'N/A';
        try {
            const date = new Date(fecha);
            return date.toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Fecha inválida';
        }
    }
}

// Exportar instancia única con métodos vinculados
module.exports = new ResultadosExamenesPDFControlador();