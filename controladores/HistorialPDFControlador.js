// ============================================
// 📄 controladores/HistorialPDFControlador.js (CORREGIDO - V8: DATOS REALES)
// ============================================
const PDFDocument = require('pdfkit');
const citaServicio = require('../servicios/CitaServicio');
const path = require('path');
const fs = require('fs');

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function extraerDatosConsulta(notas) {
    let sintomas = 'No especificado';
    let diagnostico = 'No especificado';
    let observaciones = 'No especificado';

    const sintomasMatch = notas.match(/SÍNTOMAS:\s*([\s\S]*?)(?=\n\nDIAGNÓSTICO:|$)/i);
    if (sintomasMatch) sintomas = (sintomasMatch[1] || '').trim();

    const diagnosticoMatch = notas.match(/DIAGNÓSTICO:\s*([\s\S]*?)(?=\n\nOBSERVACIONES:|$)/i);
    if (diagnosticoMatch) diagnostico = (diagnosticoMatch[1] || '').trim();

    const observacionesMatch = notas.match(/OBSERVACIONES:\s*([\s\S]*?)(?=\n\n---|$)/i);
    if (observacionesMatch) observaciones = (observacionesMatch[1] || '').trim();

    return { sintomas, diagnostico, observaciones };
}

function contarMedicamentos(citas) {
    let total = 0;
    citas.forEach(cita => {
        const notas = cita.notas || '';
        if (notas.includes('--- MEDICAMENTOS RECETADOS ---')) {
            const medicamentosSeccion = notas.match(/--- MEDICAMENTOS RECETADOS ---\n([\s\S]*?)(?=\n\n---|$)/);
            if (medicamentosSeccion) {
                total += (medicamentosSeccion[1].match(/^\d+\./gm) || []).length;
            }
        }
    });
    return total;
}

function contarExamenes(citas) {
    let total = 0;
    citas.forEach(cita => {
        const notas = cita.notas || '';
        if (notas.includes('--- EXÁMENES SOLICITADOS ---')) {
            const examenesSeccion = notas.match(/--- EXÁMENES SOLICITADOS ---\n([\s\S]*?)$/);
            if (examenesSeccion) {
                total += (examenesSeccion[1].match(/^\d+\./gm) || []).length;
            }
        }
    });
    return total;
}

function extraerMedicamentos(citas) {
    const medicamentos = [];
    citas.forEach(cita => {
        const notas = cita.notas || '';
        const fecha = new Date(cita.fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        if (notas.includes('--- MEDICAMENTOS RECETADOS ---')) {
            const medicamentosMatch = notas.match(/--- MEDICAMENTOS RECETADOS ---\n([\s\S]*?)(?=\n\n---|$)/);
            if (medicamentosMatch) {
                const medicamentosTexto = medicamentosMatch[1].trim();
                const lineas = medicamentosTexto.split('\n');

                let medicamentoActual = null;

                lineas.forEach(linea => {
                    const nombreMatch = linea.match(/^\d+\.\s*(.+)/);
                    if (nombreMatch) {
                        if (medicamentoActual) {
                            medicamentos.push(medicamentoActual);
                        }
                        medicamentoActual = {
                            nombre: nombreMatch[1].trim(),
                            dosis: '',
                            frecuencia: '',
                            duracion: '',
                            indicaciones: '',
                            fecha,
                            medico: cita.medicoNombre || 'No registrado'
                        };
                    } else if (medicamentoActual) {
                        if (linea.includes('Dosis:')) {
                            medicamentoActual.dosis = linea.replace('Dosis:', '').trim();
                        } else if (linea.includes('Frecuencia:')) {
                            medicamentoActual.frecuencia = linea.replace('Frecuencia:', '').trim();
                        } else if (linea.includes('Duración:')) {
                            medicamentoActual.duracion = linea.replace('Duración:', '').trim();
                        } else if (linea.includes('Indicaciones:')) {
                            medicamentoActual.indicaciones = linea.replace('Indicaciones:', '').trim();
                        }
                    }
                });

                if (medicamentoActual) {
                    medicamentos.push(medicamentoActual);
                }
            }
        }
    });
    return medicamentos;
}

function extraerExamenes(citas) {
    const examenes = [];
    citas.forEach(cita => {
        const notas = cita.notas || '';
        const fecha = new Date(cita.fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        if (notas.includes('--- EXÁMENES SOLICITADOS ---')) {
            const examenesMatch = notas.match(/--- EXÁMENES SOLICITADOS ---\n([\s\S]*?)$/);
            if (examenesMatch) {
                const examenesTexto = examenesMatch[1].trim();
                const lineas = examenesTexto.split('\n');

                let examenActual = null;

                lineas.forEach(linea => {
                    const nombreMatch = linea.match(/^\d+\.\s*(.+)/);
                    if (nombreMatch) {
                        if (examenActual) {
                            examenes.push(examenActual);
                        }

                        const nombreCompleto = nombreMatch[1].trim();
                        const nombreTipoMatch = nombreCompleto.match(/^(.+?)\s*\((.+?)\)/);

                        examenActual = {
                            nombre: nombreTipoMatch ? nombreTipoMatch[1].trim() : nombreCompleto,
                            tipo: nombreTipoMatch ? nombreTipoMatch[2].trim() : '',
                            prioridad: '',
                            indicaciones: '',
                            fecha,
                            medico: cita.medicoNombre || 'No registrado'
                        };
                    } else if (examenActual) {
                        if (linea.includes('Prioridad:')) {
                            examenActual.prioridad = linea.replace('Prioridad:', '').trim();
                        } else if (linea.includes('Indicaciones:')) {
                            examenActual.indicaciones = linea.replace('Indicaciones:', '').trim();
                        }
                    }
                });

                if (examenActual) {
                    examenes.push(examenActual);
                }
            }
        }
    });
    return examenes;
}

// ============================================
// CLASE CONTROLADOR
// ============================================

class HistorialPDFControlador {

    async generarHistorialPDF(req, res) {
        let pdfStarted = false;
        let doc;

        try {
            // ============================================
            // OBTENER DATOS DEL PACIENTE (USANDO PATRON DE CitaServicio)
            // ============================================
            const usuarioRaw = req.usuario;

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔍 DEBUG - req.usuario COMPLETO:');
            console.log(JSON.stringify(usuarioRaw, null, 2));
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // Convertir a JSON si es modelo Sequelize (igual que en CitaServicio)
            const usuarioJSON = usuarioRaw.toJSON ? usuarioRaw.toJSON() : usuarioRaw;

            console.log('📋 Usuario convertido a JSON:');
            console.log(JSON.stringify(usuarioJSON, null, 2));
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // Extraer datos usando el patrón del servicio: usuarioJSON.campo ? usuarioJSON.campo : 'default'
            const idPaciente = usuarioJSON.id;
            const nombre = usuarioJSON.nombre ? usuarioJSON.nombre : 'No registrado';
            const identificacion = usuarioJSON.identificacion ? usuarioJSON.identificacion : 'No registrada';
            const tipoIdRaw = usuarioJSON.tipo_identificacion ? usuarioJSON.tipo_identificacion : '';
            const tipoIdentificacion = tipoIdRaw ? tipoIdRaw.replace(/_/g, ' ').toUpperCase() : 'No especificado';
            const correo = usuarioJSON.correo ? usuarioJSON.correo : 'No registrado';
            const telefono = usuarioJSON.telefono ? usuarioJSON.telefono : 'No registrado';
            const direccion = usuarioJSON.direccion ? usuarioJSON.direccion : 'No registrada';
            const pais = usuarioJSON.pais ? usuarioJSON.pais : 'No especificado';
            const ciudad = usuarioJSON.ciudad ? usuarioJSON.ciudad : 'No especificada';

            let fechaNacimiento = 'No registrada';
            let edad = 'N/A';

            if (usuarioJSON.fecha_nacimiento) {
                try {
                    const fechaNac = new Date(usuarioJSON.fecha_nacimiento);
                    fechaNacimiento = fechaNac.toLocaleDateString('es-ES');

                    const hoy = new Date();
                    let edadCalculada = hoy.getFullYear() - fechaNac.getFullYear();
                    const mes = hoy.getMonth() - fechaNac.getMonth();
                    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
                        edadCalculada--;
                    }
                    edad = edadCalculada.toString() + ' años';
                } catch (error) {
                    console.warn('⚠️ Error al procesar fecha de nacimiento:', error);
                }
            }

            console.log('✅ DATOS EXTRAÍDOS PARA PDF:');
            console.log({
                idPaciente,
                nombre,
                identificacion,
                tipoIdentificacion,
                correo,
                telefono,
                direccion,
                pais,
                ciudad,
                fechaNacimiento,
                edad
            });
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            if (!idPaciente) {
                throw new Error('ID del paciente no encontrado.');
            }

            // Obtener citas
            const citas = await citaServicio.obtenerCitasPorPaciente(idPaciente);
            const citasCompletadas = citas.filter(c => c.estado === 'completada');

            console.log(`📋 Total citas completadas: ${citasCompletadas.length}`);

            // ============================================
            // CREAR DOCUMENTO PDF
            // ============================================
            doc = new PDFDocument({
                size: 'LETTER',
                margins: { top: 60, bottom: 60, left: 50, right: 50 }
            });

            // Configurar headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=historial-medico-${nombre.replace(/\s+/g, '-')}.pdf`);

            doc.pipe(res);
            pdfStarted = true;

            // ============================================
            // ENCABEZADO CON LOGO
            // ============================================
            const logoPath = path.join(__dirname, '..', 'Public', 'images', 'logo.png');

            if (fs.existsSync(logoPath)) {
                try {
                    doc.image(logoPath, 50, 50, { width: 60 });
                    console.log('✅ Logo cargado correctamente');
                } catch (logoError) {
                    console.warn('⚠️ No se pudo cargar el logo:', logoError);
                }
            } else {
                console.warn('⚠️ Logo no encontrado en:', logoPath);
            }

            doc.fontSize(26)
                .fillColor('#0077b6')
                .font('Helvetica-Bold')
                .text('HISTORIAL MÉDICO', 130, 60, { align: 'left' });

            doc.fontSize(12)
                .fillColor('#666')
                .font('Helvetica')
                .text('VITAL+ Sistema de Gestión Médica', 130, 90, { align: 'left' })
                .moveDown(3);

            // ============================================
            // INFORMACIÓN DEL PACIENTE (3 COLUMNAS)
            // ============================================
            doc.fontSize(14)
                .fillColor('#0077b6')
                .font('Helvetica-Bold')
                .text('INFORMACIÓN DEL PACIENTE', 50, doc.y)
                .moveDown(0.5);

            const infoBoxY = doc.y;
            doc.rect(50, infoBoxY, 512, 160)
                .fillAndStroke('#f0f7fb', '#0077b6');

            console.log('📝 Escribiendo en PDF - Nombre:', nombre);
            console.log('📝 Escribiendo en PDF - Identificación:', identificacion);
            console.log('📝 Escribiendo en PDF - Correo:', correo);

            doc.fontSize(9)
                .fillColor('#333')
                .font('Helvetica');

            let currentY = infoBoxY + 15;
            const col1 = 65;
            const col2 = 235;
            const col3 = 405;

            // FILA 1
            doc.font('Helvetica-Bold').text('Nombre:', col1, currentY);
            doc.font('Helvetica').text(nombre, col1, currentY + 12, { width: 160, lineBreak: false, ellipsis: true });

            doc.font('Helvetica-Bold').text('Identificación:', col2, currentY);
            doc.font('Helvetica').text(identificacion, col2, currentY + 12, { width: 160 });

            doc.font('Helvetica-Bold').text('Tipo ID:', col3, currentY);
            doc.font('Helvetica').text(tipoIdentificacion, col3, currentY + 12, { width: 145 });

            // FILA 2
            currentY += 35;
            doc.font('Helvetica-Bold').text('Correo:', col1, currentY);
            doc.font('Helvetica').text(correo, col1, currentY + 12, { width: 160, lineBreak: false, ellipsis: true });

            doc.font('Helvetica-Bold').text('Teléfono:', col2, currentY);
            doc.font('Helvetica').text(telefono, col2, currentY + 12, { width: 160 });

            doc.font('Helvetica-Bold').text('F. Nacimiento:', col3, currentY);
            doc.font('Helvetica').text(fechaNacimiento, col3, currentY + 12, { width: 145 });

            // FILA 3
            currentY += 35;
            doc.font('Helvetica-Bold').text('País:', col1, currentY);
            doc.font('Helvetica').text(pais, col1, currentY + 12, { width: 160 });

            doc.font('Helvetica-Bold').text('Ciudad:', col2, currentY);
            doc.font('Helvetica').text(ciudad, col2, currentY + 12, { width: 160 });

            doc.font('Helvetica-Bold').text('Edad:', col3, currentY);
            doc.font('Helvetica').text(edad, col3, currentY + 12, { width: 145 });

            // FILA 4
            currentY += 35;
            doc.font('Helvetica-Bold').text('Dirección:', col1, currentY);
            doc.font('Helvetica').text(direccion, col1, currentY + 12, { width: 480, lineBreak: true });

            console.log('✅ Información del paciente escrita en el PDF');

            doc.y = infoBoxY + 170;
            doc.moveDown(1);

            // ============================================
            // ESTADÍSTICAS
            // ============================================
            const totalMedicamentos = contarMedicamentos(citasCompletadas);
            const totalExamenes = contarExamenes(citasCompletadas);

            doc.fontSize(14)
                .fillColor('#0077b6')
                .font('Helvetica-Bold')
                .text('RESUMEN ESTADÍSTICO', 50, doc.y)
                .moveDown(0.5);

            const statsY = doc.y;
            const statsBoxWidth = 128;
            const statsStartX = 50;

            // Tarjeta 1
            doc.rect(statsStartX, statsY, statsBoxWidth, 60)
                .fillAndStroke('#e3f2fd', '#0077b6');
            doc.fontSize(24).fillColor('#0077b6').font('Helvetica-Bold')
                .text(citasCompletadas.length.toString(), statsStartX, statsY + 10, {
                    width: statsBoxWidth,
                    align: 'center'
                });
            doc.fontSize(10).fillColor('#333').font('Helvetica')
                .text('Consultas', statsStartX, statsY + 40, {
                    width: statsBoxWidth,
                    align: 'center'
                });

            // Tarjeta 2
            const card2X = statsStartX + statsBoxWidth;
            doc.rect(card2X, statsY, statsBoxWidth, 60)
                .fillAndStroke('#e8f5e9', '#0077b6');
            doc.fontSize(24).fillColor('#0077b6').font('Helvetica-Bold')
                .text(totalMedicamentos.toString(), card2X, statsY + 10, {
                    width: statsBoxWidth,
                    align: 'center'
                });
            doc.fontSize(10).fillColor('#333').font('Helvetica')
                .text('Medicamentos', card2X, statsY + 40, {
                    width: statsBoxWidth,
                    align: 'center'
                });

            // Tarjeta 3
            const card3X = card2X + statsBoxWidth;
            doc.rect(card3X, statsY, statsBoxWidth, 60)
                .fillAndStroke('#fff3e0', '#0077b6');
            doc.fontSize(24).fillColor('#0077b6').font('Helvetica-Bold')
                .text(totalExamenes.toString(), card3X, statsY + 10, {
                    width: statsBoxWidth,
                    align: 'center'
                });
            doc.fontSize(10).fillColor('#333').font('Helvetica')
                .text('Exámenes', card3X, statsY + 40, {
                    width: statsBoxWidth,
                    align: 'center'
                });

            // Tarjeta 4
            const card4X = card3X + statsBoxWidth;
            doc.rect(card4X, statsY, statsBoxWidth, 60)
                .fillAndStroke('#fce4ec', '#0077b6');
            doc.fontSize(10).fillColor('#0077b6').font('Helvetica-Bold')
                .text('Generado', card4X, statsY + 10, {
                    width: statsBoxWidth,
                    align: 'center'
                });
            doc.fontSize(9).fillColor('#333').font('Helvetica')
                .text(new Date().toLocaleDateString('es-ES'), card4X, statsY + 30, {
                    width: statsBoxWidth,
                    align: 'center'
                });

            doc.y = statsY + 70;
            doc.moveDown(2);

            // ============================================
            // HISTORIAL DE CONSULTAS
            // ============================================
            if (citasCompletadas.length > 0) {
                doc.addPage();

                doc.fontSize(16)
                    .fillColor('#0077b6')
                    .font('Helvetica-Bold')
                    .text('HISTORIAL DE CONSULTAS', { align: 'center' })
                    .moveDown(1.5);

                citasCompletadas.forEach((cita, index) => {
                    if (doc.y > 620) {
                        doc.addPage();
                    }

                    const fecha = new Date(cita.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    });

                    const notas = cita.notas || '';
                    const { sintomas, diagnostico, observaciones } = extraerDatosConsulta(notas);

                    const consultaY = doc.y;
                    doc.rect(50, consultaY, 512, 30)
                        .fillAndStroke('#0077b6', '#0077b6');

                    doc.fontSize(12)
                        .fillColor('white')
                        .font('Helvetica-Bold')
                        .text(`CONSULTA ${index + 1} - ${fecha}`, 60, consultaY + 10);

                    doc.y = consultaY + 35;

                    doc.fontSize(10)
                        .fillColor('#333')
                        .font('Helvetica-Bold')
                        .text('Médico: ', 60, doc.y, { continued: true })
                        .font('Helvetica')
                        .text(cita.medicoNombre || 'No registrado');

                    doc.font('Helvetica-Bold')
                        .text('Especialidad: ', 60, doc.y, { continued: true })
                        .font('Helvetica')
                        .text(cita.especialidad || 'No especificada');

                    doc.font('Helvetica-Bold')
                        .text('Motivo: ', 60, doc.y, { continued: true })
                        .font('Helvetica')
                        .text(cita.motivo_consulta || 'No especificado', {
                            width: 450
                        });

                    doc.moveDown(0.5);

                    doc.font('Helvetica-Bold')
                        .fillColor('#0077b6')
                        .text('Síntomas:', 60, doc.y);
                    doc.font('Helvetica')
                        .fillColor('#333')
                        .text(sintomas, 70, doc.y, {
                            width: 480,
                            align: 'justify'
                        });
                    doc.moveDown(0.5);

                    doc.font('Helvetica-Bold')
                        .fillColor('#0077b6')
                        .text('Diagnóstico:', 60, doc.y);
                    doc.font('Helvetica')
                        .fillColor('#333')
                        .text(diagnostico, 70, doc.y, {
                            width: 480,
                            align: 'justify'
                        });
                    doc.moveDown(0.5);

                    doc.font('Helvetica-Bold')
                        .fillColor('#0077b6')
                        .text('Observaciones / Tratamiento:', 60, doc.y);
                    doc.font('Helvetica')
                        .fillColor('#333')
                        .text(observaciones, 70, doc.y, {
                            width: 480,
                            align: 'justify'
                        });

                    doc.moveDown(1);

                    doc.strokeColor('#e0e0e0')
                        .lineWidth(1)
                        .moveTo(50, doc.y)
                        .lineTo(562, doc.y)
                        .stroke();

                    doc.moveDown(1.5);
                });
            }

            // ============================================
            // MEDICAMENTOS
            // ============================================
            const medicamentos = extraerMedicamentos(citasCompletadas);
            if (medicamentos.length > 0) {
                doc.addPage();

                doc.fontSize(16)
                    .fillColor('#0077b6')
                    .font('Helvetica-Bold')
                    .text('MEDICAMENTOS RECETADOS', { align: 'center' })
                    .moveDown(1.5);

                medicamentos.forEach((med, index) => {
                    if (doc.y > 620) {
                        doc.addPage();
                    }

                    const medY = doc.y;
                    doc.rect(50, medY, 512, 25)
                        .fillAndStroke('#28a745', '#28a745');

                    doc.fontSize(11)
                        .fillColor('white')
                        .font('Helvetica-Bold')
                        .text(`💊 ${index + 1}. ${med.nombre}`, 60, medY + 7);

                    doc.y = medY + 30;

                    doc.fontSize(10)
                        .fillColor('#333')
                        .font('Helvetica-Bold')
                        .text('Dosis: ', 60, doc.y, { continued: true })
                        .font('Helvetica')
                        .text(med.dosis || 'No especificada');

                    doc.font('Helvetica-Bold')
                        .text('Frecuencia: ', 60, doc.y, { continued: true })
                        .font('Helvetica')
                        .text(med.frecuencia || 'No especificada');

                    doc.font('Helvetica-Bold')
                        .text('Duración: ', 60, doc.y, { continued: true })
                        .font('Helvetica')
                        .text(med.duracion || 'No especificada');

                    doc.font('Helvetica-Bold')
                        .text('Indicaciones: ', 60, doc.y, { continued: true })
                        .font('Helvetica')
                        .text(med.indicaciones || 'No especificadas', {
                            width: 450
                        });

                    doc.fontSize(9)
                        .fillColor('#666')
                        .font('Helvetica')
                        .text(`Recetado por: ${med.medico} el ${med.fecha}`, 60, doc.y);

                    doc.moveDown(1);

                    doc.strokeColor('#e0e0e0')
                        .lineWidth(1)
                        .moveTo(50, doc.y)
                        .lineTo(562, doc.y)
                        .stroke();

                    doc.moveDown(1);
                });
            }

            // ============================================
            // EXÁMENES
            // ============================================
            const examenes = extraerExamenes(citasCompletadas);
            if (examenes.length > 0) {
                doc.addPage();

                doc.fontSize(16)
                    .fillColor('#0077b6')
                    .font('Helvetica-Bold')
                    .text('EXÁMENES SOLICITADOS', { align: 'center' })
                    .moveDown(1.5);

                examenes.forEach((ex, index) => {
                    if (doc.y > 620) {
                        doc.addPage();
                    }

                    const exY = doc.y;
                    doc.rect(50, exY, 512, 25)
                        .fillAndStroke('#ffc107', '#ffc107');

                    doc.fontSize(11)
                        .fillColor('#333')
                        .font('Helvetica-Bold')
                        .text(`🔬 ${index + 1}. ${ex.nombre}${ex.tipo ? ` (${ex.tipo})` : ''}`, 60, exY + 7);

                    doc.y = exY + 30;

                    doc.fontSize(10)
                        .fillColor('#333')
                        .font('Helvetica-Bold')
                        .text('Prioridad: ', 60, doc.y, { continued: true })
                        .font('Helvetica')
                        .text(ex.prioridad || 'Normal');

                    doc.font('Helvetica-Bold')
                        .text('Indicaciones: ', 60, doc.y, { continued: true })
                        .font('Helvetica')
                        .text(ex.indicaciones || 'No especificadas', {
                            width: 450
                        });

                    doc.fontSize(9)
                        .fillColor('#666')
                        .font('Helvetica')
                        .text(`Solicitado por: ${ex.medico} el ${ex.fecha}`, 60, doc.y);

                    doc.moveDown(1);

                    doc.strokeColor('#e0e0e0')
                        .lineWidth(1)
                        .moveTo(50, doc.y)
                        .lineTo(562, doc.y)
                        .stroke();

                    doc.moveDown(1);
                });
            }

            // ============================================
            // PIE DE PÁGINA
            // ============================================
            doc.on('pageAdded', () => {
                const pageNumber = doc._pageBuffer.length;
                doc.fontSize(8)
                    .fillColor('#999')
                    .font('Helvetica')
                    .text(
                        `Documento generado automáticamente por VITAL+ | Página ${pageNumber}`,
                        50,
                        doc.page.height - 50,
                        { align: 'center', width: 512 }
                    );
            });

            doc.end();
            console.log('✅ PDF generado exitosamente');

        } catch (error) {
            console.error('❌ Error al generar PDF:', error);
            console.error('Stack trace:', error.stack);

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
}

module.exports = new HistorialPDFControlador();