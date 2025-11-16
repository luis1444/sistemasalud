// ============================================
// 📄 controladores/HistorialPDFControlador.js (CORREGIDO - Tablas)
// ============================================
const PDFDocument = require('pdfkit');
const citaServicio = require('../servicios/CitaServicio');

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function extraerDatosConsulta(notas) {
    let sintomas = 'No especificado';
    let diagnostico = 'No especificado';
    let observaciones = 'No especificado';

    const sintomasMatch = notas.match(/SÍNTOMAS:\s*([\s\S]*?)(?=\n\nDIAGNÓSTICO:|$)/i);
    if (sintomasMatch) sintomas = sintomasMatch[1].trim();

    const diagnosticoMatch = notas.match(/DIAGNÓSTICO:\s*([\s\S]*?)(?=\n\nOBSERVACIONES:|$)/i);
    if (diagnosticoMatch) diagnostico = diagnosticoMatch[1].trim();

    const observacionesMatch = notas.match(/OBSERVACIONES:\s*([\s\S]*?)(?=\n\n---|$)/i);
    if (observacionesMatch) observaciones = observacionesMatch[1].trim();

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
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        if (notas.includes('--- MEDICAMENTOS RECETADOS ---')) {
            const medicamentosMatch = notas.match(/--- MEDICAMENTOS RECETADOS ---\n([\s\S]*?)(?=\n\n---|$)/);
            if (medicamentosMatch) {
                const medicamentosArray = medicamentosMatch[1].trim().split(/\n(?=\d+\.)/);

                medicamentosArray.forEach(medTexto => {
                    const nombreMatch = medTexto.match(/^\d+\.\s*(.+)/);
                    const nombre = nombreMatch ? nombreMatch[1].trim() : 'Medicamento';
                    const dosis = (medTexto.match(/Dosis:\s*(.+)/) || [])[1] || 'N/A';
                    const frecuencia = (medTexto.match(/Frecuencia:\s*(.+)/) || [])[1] || 'N/A';
                    const duracion = (medTexto.match(/Duración:\s*(.+)/) || [])[1] || 'N/A';
                    const indicaciones = (medTexto.match(/Indicaciones:\s*(.+)/) || [])[1] || 'N/A';

                    medicamentos.push({
                        nombre,
                        dosis,
                        frecuencia,
                        duracion,
                        indicaciones,
                        fecha,
                        medico: cita.medicoNombre || 'No registrado'
                    });
                });
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
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        if (notas.includes('--- EXÁMENES SOLICITADOS ---')) {
            const examenesMatch = notas.match(/--- EXÁMENES SOLICITADOS ---\n([\s\S]*?)$/);
            if (examenesMatch) {
                const examenesArray = examenesMatch[1].trim().split(/\n(?=\d+\.)/);

                examenesArray.forEach(exTexto => {
                    const nombreMatch = exTexto.match(/^\d+\.\s*(.+)/);
                    const nombreCompleto = nombreMatch ? nombreMatch[1].trim() : 'Examen';
                    const nombreTipoMatch = nombreCompleto.match(/^(.+?)\s*\((.+?)\)/);
                    const nombre = nombreTipoMatch ? nombreTipoMatch[1].trim() : nombreCompleto;
                    const tipo = nombreTipoMatch ? nombreTipoMatch[2].trim() : '';
                    const prioridad = (exTexto.match(/Prioridad:\s*(.+)/) || [])[1] || 'Normal';
                    const indicaciones = (exTexto.match(/Indicaciones:\s*(.+)/) || [])[1] || 'N/A';

                    examenes.push({
                        nombre,
                        tipo,
                        prioridad,
                        indicaciones,
                        fecha,
                        medico: cita.medicoNombre || 'No registrado'
                    });
                });
            }
        }
    });
    return examenes;
}

/**
 * Función para dibujar una tabla simple (simulación de tabla con PDFKit)
 * @param {PDFDocument} doc
 * @param {Array<string>} headers
 * @param {Array<Array<string>>} data
 * @param {number} y
 * @param {Array<number>} widths
 * @param {number} headerFillColor
 */
function drawTable(doc, headers, data, y, widths, headerFillColor = '#0077b6') {
    const startX = doc.page.margins.left;
    const rowHeight = 20;
    const headerRowHeight = 25;
    let currentY = y;

    // Dibujar encabezados
    doc.fillColor(headerFillColor)
        .font('Helvetica-Bold')
        .fontSize(10);

    for (let i = 0; i < headers.length; i++) {
        doc.rect(startX + widths.slice(0, i).reduce((a, b) => a + b, 0), currentY, widths[i], headerRowHeight)
            .fill(headerFillColor);

        doc.fillColor('white')
            .text(headers[i], startX + widths.slice(0, i).reduce((a, b) => a + b, 0) + 5, currentY + 8, {
                width: widths[i] - 10,
                align: 'left'
            });
    }

    currentY += headerRowHeight;

    // Dibujar filas de datos
    doc.font('Helvetica').fontSize(9);

    data.forEach((row, rowIndex) => {
        const rowColor = rowIndex % 2 === 0 ? '#f0f0f0' : '#ffffff';

        // Verificar salto de página para datos
        if (currentY + rowHeight > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            currentY = doc.page.margins.top;

            // Redibujar encabezados en la nueva página
            doc.fillColor(headerFillColor)
                .font('Helvetica-Bold')
                .fontSize(10);

            for (let i = 0; i < headers.length; i++) {
                doc.rect(startX + widths.slice(0, i).reduce((a, b) => a + b, 0), currentY, widths[i], headerRowHeight)
                    .fill(headerFillColor);

                doc.fillColor('white')
                    .text(headers[i], startX + widths.slice(0, i).reduce((a, b) => a + b, 0) + 5, currentY + 8, {
                        width: widths[i] - 10,
                        align: 'left'
                    });
            }
            currentY += headerRowHeight;
            doc.font('Helvetica').fontSize(9);
        }

        doc.fillColor(rowColor)
            .rect(startX, currentY, widths.reduce((a, b) => a + b, 0), rowHeight)
            .fill(rowColor);

        doc.fillColor('#333');
        for (let i = 0; i < row.length; i++) {
            doc.text(row[i], startX + widths.slice(0, i).reduce((a, b) => a + b, 0) + 5, currentY + 7, {
                width: widths[i] - 10,
                align: 'left',
                ellipsis: true,
            });
        }
        currentY += rowHeight;
    });

    // Devolver la posición Y final después de la tabla
    return currentY;
}

// ============================================
// CLASE CONTROLADOR
// ============================================

class HistorialPDFControlador {

    async generarHistorialPDF(req, res) {
        let pdfStarted = false;
        let doc;

        try {
            const idPaciente = req.usuario.id;
            const paciente = req.usuario;

            // Acceso seguro a los datos del paciente desde el objeto req.usuario
            const identificacion = paciente.identificacion || 'No registrada';
            const tipoIdentificacion = paciente.tipo_identificacion ? `(${paciente.tipo_identificacion.toUpperCase()})` : '';
            const telefono = paciente.telefono || 'No registrado';
            const fechaNacimiento = paciente.fecha_nacimiento ?
                new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES') : 'No registrada';
            const edad = paciente.fecha_nacimiento ?
                new Date(new Date() - new Date(paciente.fecha_nacimiento)).getFullYear() - 1970 : 'N/A';
            const ubicacion = `${paciente.ciudad || 'N/A'}, ${paciente.pais || 'N/A'}`;

            console.log(`📄 Generando PDF del historial del paciente ID: ${idPaciente}`);

            // Obtener todas las citas del paciente
            const citas = await citaServicio.obtenerCitasPorPaciente(idPaciente);
            const citasCompletadas = citas.filter(c => c.estado === 'completada');

            console.log(`📋 Total citas completadas: ${citasCompletadas.length}`);

            // Crear documento PDF
            doc = new PDFDocument({
                size: 'LETTER',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            // Configurar headers para descarga
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=historial-medico-${paciente.nombre.replace(/\s+/g, '-')}.pdf`);

            // Pipe del PDF a la respuesta
            doc.pipe(res);
            pdfStarted = true; // Marcamos que el pipe ha comenzado

            // ============================================
            // ENCABEZADO DEL DOCUMENTO
            // ============================================
            doc.fontSize(24)
                .fillColor('#0077b6')
                .text('HISTORIAL MÉDICO', { align: 'center' })
                .moveDown(0.5);

            doc.fontSize(12)
                .fillColor('#333')
                .text('VITAL+ Sistema de Gestión Médica', { align: 'center' })
                .moveDown(2);

            // ============================================
            // INFORMACIÓN DEL PACIENTE (EN TABLA)
            // ============================================
            doc.fontSize(14)
                .fillColor('#0077b6')
                .text('INFORMACIÓN DEL PACIENTE', { underline: true })
                .moveDown(0.5);

            const infoHeaders = ['Dato', 'Valor', 'Dato', 'Valor'];
            const infoData = [
                ['Nombre', paciente.nombre || 'N/A', 'ID / Tipo', `${identificacion} ${tipoIdentificacion}`],
                ['Correo', paciente.correo || 'N/A', 'Teléfono', telefono],
                ['F. Nacimiento', fechaNacimiento, 'Edad', edad.toString()],
                ['Ubicación', ubicacion, 'F. Generación', new Date().toLocaleDateString('es-ES')]
            ];

            const infoWidths = [100, 181, 100, 181]; // Total width 562 (50+512+50)
            let currentY = drawTable(doc, infoHeaders, infoData, doc.y, infoWidths);
            doc.y = currentY + 20; // Espacio después de la tabla

            // ============================================
            // RESUMEN ESTADÍSTICO (EN TABLA)
            // ============================================
            const totalMedicamentos = contarMedicamentos(citasCompletadas);
            const totalExamenes = contarExamenes(citasCompletadas);

            doc.fontSize(14)
                .fillColor('#0077b6')
                .text('RESUMEN ESTADÍSTICO', { underline: true })
                .moveDown(0.5);

            const statsHeaders = ['Métrica', 'Total', 'Métrica', 'Total'];
            const statsData = [
                ['Consultas Completadas', citasCompletadas.length.toString(), 'Medicamentos Recetados', totalMedicamentos.toString()],
                ['Exámenes Solicitados', totalExamenes.toString(), 'Documento Generado', new Date().toLocaleDateString('es-ES')]
            ];

            const statsWidths = [150, 131, 150, 131];
            currentY = drawTable(doc, statsHeaders, statsData, doc.y, statsWidths);
            doc.y = currentY + 20;

            // ============================================
            // HISTORIAL DE CONSULTAS (DETALLADO)
            // ============================================
            if (citasCompletadas.length > 0) {
                doc.addPage();
                doc.fontSize(16)
                    .fillColor('#0077b6')
                    .text('HISTORIAL DE CONSULTAS MÉDICAS', { align: 'center', underline: true })
                    .moveDown(1);

                citasCompletadas.forEach((cita, index) => {
                    // Verificar si necesitamos una nueva página antes de dibujar el encabezado
                    if (doc.y > 650) {
                        doc.addPage();
                    }

                    const fecha = new Date(cita.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    const notas = cita.notas || '';
                    const { sintomas, diagnostico, observaciones } = extraerDatosConsulta(notas);

                    // Título de la consulta
                    doc.fontSize(12)
                        .fillColor('#333')
                        .font('Helvetica-Bold')
                        .text(`CONSULTA ${index + 1} - ${fecha} (${cita.especialidad || 'N/A'})`, { underline: false })
                        .moveDown(0.5);

                    // Tabla de Resumen de la Consulta
                    const consultaHeaders = ['Médico', 'Motivo de Consulta'];
                    const consultaData = [
                        [cita.medicoNombre || 'No registrado', cita.motivo_consulta || 'No especificado']
                    ];
                    const consultaWidths = [180, 382];
                    currentY = drawTable(doc, consultaHeaders, consultaData, doc.y, consultaWidths, '#e0e0e0');
                    doc.y = currentY + 10;

                    // Contenido detallado (No se usa tabla para bloques grandes de texto)
                    doc.fontSize(10)
                        .fillColor('#333')
                        .font('Helvetica-Bold')
                        .text('Síntomas:', doc.page.margins.left)
                        .font('Helvetica')
                        .text(sintomas, { indent: 15, width: 500 })
                        .moveDown(0.3);

                    doc.font('Helvetica-Bold')
                        .text('Diagnóstico:')
                        .font('Helvetica')
                        .text(diagnostico, { indent: 15, width: 500 })
                        .moveDown(0.3);

                    doc.font('Helvetica-Bold')
                        .text('Observaciones / Plan:')
                        .font('Helvetica')
                        .text(observaciones, { indent: 15, width: 500 })
                        .moveDown(1);

                    // Línea separadora
                    doc.strokeColor('#e0e0e0')
                        .lineWidth(1)
                        .moveTo(50, doc.y)
                        .lineTo(562, doc.y)
                        .stroke()
                        .moveDown(1);
                });
            }

            // ============================================
            // MEDICAMENTOS RECETADOS (EN TABLA)
            // ============================================
            const medicamentos = extraerMedicamentos(citasCompletadas);
            if (medicamentos.length > 0) {
                doc.addPage();
                doc.fontSize(16)
                    .fillColor('#0077b6')
                    .text('REGISTRO DE MEDICAMENTOS RECETADOS', { align: 'center', underline: true })
                    .moveDown(1);

                const medHeaders = ['Fecha', 'Medicamento', 'Dosis/Frecuencia', 'Duración', 'Médico'];
                const medData = medicamentos.map(m => [
                    m.fecha,
                    m.nombre,
                    `${m.dosis} / ${m.frecuencia}`,
                    m.duracion,
                    m.medico
                ]);
                const medWidths = [60, 160, 140, 80, 122];

                currentY = drawTable(doc, medHeaders, medData, doc.y, medWidths);
                doc.y = currentY + 20;

                // Nota sobre indicaciones
                doc.fontSize(9).fillColor('#666').text('* Las indicaciones completas se encuentran en el registro de la consulta correspondiente.');
            }

            // ============================================
            // EXÁMENES SOLICITADOS (EN TABLA)
            // ============================================
            const examenes = extraerExamenes(citasCompletadas);
            if (examenes.length > 0) {
                doc.addPage();
                doc.fontSize(16)
                    .fillColor('#0077b6')
                    .text('REGISTRO DE EXÁMENES SOLICITADOS', { align: 'center', underline: true })
                    .moveDown(1);

                const exHeaders = ['Fecha', 'Examen', 'Tipo', 'Prioridad', 'Médico'];
                const exData = examenes.map(e => [
                    e.fecha,
                    e.nombre,
                    e.tipo || 'N/A',
                    e.prioridad,
                    e.medico
                ]);
                const exWidths = [60, 180, 100, 80, 142];

                currentY = drawTable(doc, exHeaders, exData, doc.y, exWidths);
                doc.y = currentY + 20;

                // Nota sobre indicaciones
                doc.fontSize(9).fillColor('#666').text('* Las indicaciones completas se encuentran en el registro de la consulta correspondiente.');
            }

            // ============================================
            // PIE DE PÁGINA
            // ============================================

            // Forzar la escritura de todas las páginas al buffer interno.
            doc.flushPages();

            // Usar la propiedad de índice de página para obtener el total.
            const totalPaginas = doc.page.index + 1;

            for (let i = 0; i < totalPaginas; i++) {
                doc.switchToPage(i);
                doc.fontSize(8)
                    .fillColor('#999')
                    .text(
                        'Este documento es un resumen del historial médico generado automáticamente por VITAL+',
                        50,
                        750,
                        { align: 'center', width: 512 }
                    );
            }

            // Finalizar documento y el stream de respuesta
            doc.end();

            console.log('✅ PDF generado exitosamente');

        } catch (error) {
            console.error('❌ Error al generar PDF del historial:', error);

            if (pdfStarted) {
                if (doc && !doc.ended) {
                    try {
                        doc.end();
                    } catch (endError) {
                        res.end();
                    }
                }
                console.log('⚠️ PDF iniciado. Stream de respuesta cerrado tras un error de generación.');
            } else {
                res.status(500).json({
                    exito: false,
                    mensaje: 'Error al generar el PDF del historial médico: ' + error.message
                });
            }
        }
    }
}

module.exports = new HistorialPDFControlador();