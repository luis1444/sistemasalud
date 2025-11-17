const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database'); // ✅ IMPORTAR sequelize correctamente
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { QueryTypes } = require('sequelize'); // ✅ Para especificar tipo de query

// ============================================
// OBTENER TODAS LAS DISPENSACIONES
// ============================================
router.get('/', verificarToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                d.*,
                a.descripcion as medicamento,
                a.cantidad as cantidad_autorizada,
                a.prioridad,
                p.nombre as paciente_nombre,
                p.identificacion as paciente_identificacion,
                p.correo as paciente_correo,
                f.nombre as farmaceutico_nombre,
                f.correo as farmaceutico_correo,
                m.nombre as medico_nombre,
                m.especialidad as medico_especialidad
            FROM dispensaciones d
            LEFT JOIN autorizaciones a ON d."idAutorizacion" = a.id
            LEFT JOIN usuarios p ON a."idPaciente" = p.id
            LEFT JOIN usuarios f ON d."idFarmaceutico" = f.id
            LEFT JOIN usuarios m ON a."idMedico" = m.id
            ORDER BY d."fechaDispensacion" DESC
        `;

        const dispensaciones = await sequelize.query(query, { type: QueryTypes.SELECT });

        res.json({
            exito: true,
            datos: dispensaciones,
            total: dispensaciones.length
        });
    } catch (error) {
        console.error('Error al obtener dispensaciones:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al obtener las dispensaciones',
            error: error.message
        });
    }
});

// ============================================
// OBTENER DISPENSACIONES POR AUTORIZACIÓN
// ============================================
router.get('/autorizacion/:idAutorizacion', verificarToken, async (req, res) => {
    try {
        const { idAutorizacion } = req.params;

        const query = `
            SELECT 
                d.*,
                a.descripcion as medicamento,
                a.cantidad as cantidad_autorizada,
                f.nombre as farmaceutico_nombre,
                f.correo as farmaceutico_correo,
                f.telefono as farmaceutico_telefono
            FROM dispensaciones d
            LEFT JOIN autorizaciones a ON d."idAutorizacion" = a.id
            LEFT JOIN usuarios f ON d."idFarmaceutico" = f.id
            WHERE d."idAutorizacion" = :idAutorizacion
            ORDER BY d."fechaDispensacion" DESC
        `;

        const dispensaciones = await sequelize.query(query, {
            replacements: { idAutorizacion },
            type: QueryTypes.SELECT
        });

        res.json({
            exito: true,
            datos: dispensaciones
        });
    } catch (error) {
        console.error('Error al obtener dispensaciones por autorización:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al obtener las dispensaciones',
            error: error.message
        });
    }
});

// ============================================
// OBTENER DISPENSACIONES POR PACIENTE
// ============================================
router.get('/paciente/:idPaciente', verificarToken, async (req, res) => {
    try {
        const { idPaciente } = req.params;

        const query = `
            SELECT 
                d.*,
                a.descripcion as medicamento,
                a.cantidad as cantidad_autorizada,
                a.prioridad,
                a."duracionTratamiento",
                f.nombre as farmaceutico_nombre,
                f.correo as farmaceutico_correo,
                m.nombre as medico_nombre,
                m.especialidad as medico_especialidad
            FROM dispensaciones d
            INNER JOIN autorizaciones a ON d."idAutorizacion" = a.id
            LEFT JOIN usuarios f ON d."idFarmaceutico" = f.id
            LEFT JOIN usuarios m ON a."idMedico" = m.id
            WHERE a."idPaciente" = :idPaciente
            ORDER BY d."fechaDispensacion" DESC
        `;

        const dispensaciones = await sequelize.query(query, {
            replacements: { idPaciente },
            type: QueryTypes.SELECT
        });

        res.json({
            exito: true,
            datos: dispensaciones,
            total: dispensaciones.length
        });
    } catch (error) {
        console.error('Error al obtener dispensaciones del paciente:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al obtener las dispensaciones del paciente',
            error: error.message
        });
    }
});

// ============================================
// OBTENER DISPENSACIONES POR FARMACÉUTICO
// ============================================
router.get('/farmaceutico/:idFarmaceutico', verificarToken, async (req, res) => {
    try {
        const { idFarmaceutico } = req.params;

        const query = `
            SELECT 
                d.*,
                a.descripcion as medicamento,
                a.cantidad as cantidad_autorizada,
                p.nombre as paciente_nombre,
                p.identificacion as paciente_identificacion,
                m.nombre as medico_nombre
            FROM dispensaciones d
            INNER JOIN autorizaciones a ON d."idAutorizacion" = a.id
            INNER JOIN usuarios p ON a."idPaciente" = p.id
            LEFT JOIN usuarios m ON a."idMedico" = m.id
            WHERE d."idFarmaceutico" = :idFarmaceutico
            ORDER BY d."fechaDispensacion" DESC
        `;

        const dispensaciones = await sequelize.query(query, {
            replacements: { idFarmaceutico },
            type: QueryTypes.SELECT
        });

        res.json({
            exito: true,
            datos: dispensaciones,
            total: dispensaciones.length
        });
    } catch (error) {
        console.error('Error al obtener dispensaciones del farmacéutico:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al obtener las dispensaciones del farmacéutico',
            error: error.message
        });
    }
});

// ============================================
// CREAR UNA NUEVA DISPENSACIÓN
// ============================================
router.post('/', verificarToken, verificarRol(['farmacia']), async (req, res) => {
    try {
        const { idAutorizacion, idFarmaceutico, cantidad, observaciones } = req.body;

        console.log('📦 Datos recibidos para dispensación:', {
            idAutorizacion,
            idFarmaceutico,
            cantidad,
            observaciones
        });

        // Validar datos requeridos
        if (!idAutorizacion || !idFarmaceutico) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Faltan datos requeridos (idAutorizacion, idFarmaceutico)'
            });
        }

        // Verificar que la autorización existe y está aprobada
        const autorizacion = await sequelize.query(
            'SELECT * FROM autorizaciones WHERE id = :idAutorizacion AND estado = :estado',
            {
                replacements: { idAutorizacion, estado: 'aprobada' },
                type: QueryTypes.SELECT
            }
        );

        if (autorizacion.length === 0) {
            return res.status(404).json({
                exito: false,
                mensaje: 'No se encontró una autorización aprobada con ese ID'
            });
        }

        console.log('✅ Autorización encontrada:', autorizacion[0]);

        // Verificar si ya existe una dispensación para esta autorización
        const dispensacionExistente = await sequelize.query(
            'SELECT * FROM dispensaciones WHERE "idAutorizacion" = :idAutorizacion',
            {
                replacements: { idAutorizacion },
                type: QueryTypes.SELECT
            }
        );

        if (dispensacionExistente.length > 0) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Este medicamento ya fue dispensado anteriormente',
                fechaDispensacion: dispensacionExistente[0].fechaDispensacion
            });
        }

        // Verificar que el farmacéutico existe
        const farmaceutico = await sequelize.query(
            'SELECT * FROM usuarios WHERE id = :idFarmaceutico AND rol = :rol',
            {
                replacements: { idFarmaceutico, rol: 'farmacia' },
                type: QueryTypes.SELECT
            }
        );

        if (farmaceutico.length === 0) {
            return res.status(404).json({
                exito: false,
                mensaje: 'No se encontró el farmacéutico especificado'
            });
        }

        console.log('✅ Farmacéutico encontrado:', farmaceutico[0].nombre);

        // Crear la dispensación
        const cantidadFinal = cantidad || autorizacion[0].cantidad || null;

        const queryInsert = `
            INSERT INTO dispensaciones 
            ("idAutorizacion", "idFarmaceutico", cantidad, observaciones, "fechaDispensacion")
            VALUES (:idAutorizacion, :idFarmaceutico, :cantidad, :observaciones, NOW())
            RETURNING id
        `;

        const resultado = await sequelize.query(queryInsert, {
            replacements: {
                idAutorizacion,
                idFarmaceutico,
                cantidad: cantidadFinal,
                observaciones
            },
            type: QueryTypes.INSERT
        });

        const insertId = resultado[0][0].id;
        console.log('✅ Dispensación creada con ID:', insertId);

        // Obtener la dispensación creada con información completa
        const dispensacionCreada = await sequelize.query(`
            SELECT 
                d.*,
                a.descripcion as medicamento,
                a.cantidad as cantidad_autorizada,
                a.prioridad,
                a."duracionTratamiento",
                p.nombre as paciente_nombre,
                p.identificacion as paciente_identificacion,
                p.correo as paciente_correo,
                p.telefono as paciente_telefono,
                f.nombre as farmaceutico_nombre,
                f.correo as farmaceutico_correo,
                m.nombre as medico_nombre,
                m.especialidad as medico_especialidad
            FROM dispensaciones d
            INNER JOIN autorizaciones a ON d."idAutorizacion" = a.id
            INNER JOIN usuarios p ON a."idPaciente" = p.id
            INNER JOIN usuarios f ON d."idFarmaceutico" = f.id
            LEFT JOIN usuarios m ON a."idMedico" = m.id
            WHERE d.id = :id
        `, {
            replacements: { id: insertId },
            type: QueryTypes.SELECT
        });

        res.status(201).json({
            exito: true,
            mensaje: 'Dispensación registrada correctamente',
            datos: dispensacionCreada[0]
        });

    } catch (error) {
        console.error('❌ Error al crear dispensación:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al registrar la dispensación',
            error: error.message
        });
    }
});

// ============================================
// OBTENER DISPENSACIÓN POR ID
// ============================================
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                d.*,
                a.descripcion as medicamento,
                a.cantidad as cantidad_autorizada,
                a.prioridad,
                a.justificacion,
                a."duracionTratamiento",
                p.nombre as paciente_nombre,
                p.identificacion as paciente_identificacion,
                p.correo as paciente_correo,
                p.telefono as paciente_telefono,
                f.nombre as farmaceutico_nombre,
                f.correo as farmaceutico_correo,
                f.telefono as farmaceutico_telefono,
                m.nombre as medico_nombre,
                m.especialidad as medico_especialidad,
                m.correo as medico_correo
            FROM dispensaciones d
            INNER JOIN autorizaciones a ON d."idAutorizacion" = a.id
            INNER JOIN usuarios p ON a."idPaciente" = p.id
            LEFT JOIN usuarios f ON d."idFarmaceutico" = f.id
            LEFT JOIN usuarios m ON a."idMedico" = m.id
            WHERE d.id = :id
        `;

        const dispensacion = await sequelize.query(query, {
            replacements: { id },
            type: QueryTypes.SELECT
        });

        if (dispensacion.length === 0) {
            return res.status(404).json({
                exito: false,
                mensaje: 'Dispensación no encontrada'
            });
        }

        res.json({
            exito: true,
            datos: dispensacion[0]
        });

    } catch (error) {
        console.error('Error al obtener dispensación:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al obtener la dispensación',
            error: error.message
        });
    }
});

// ============================================
// ACTUALIZAR OBSERVACIONES DE DISPENSACIÓN
// ============================================
router.put('/:id/observaciones', verificarToken, verificarRol(['farmacia', 'admin', 'administrador']), async (req, res) => {
    try {
        const { id } = req.params;
        const { observaciones } = req.body;

        const query = `
            UPDATE dispensaciones 
            SET observaciones = :observaciones
            WHERE id = :id
        `;

        await sequelize.query(query, {
            replacements: { observaciones, id },
            type: QueryTypes.UPDATE
        });

        res.json({
            exito: true,
            mensaje: 'Observaciones actualizadas correctamente'
        });

    } catch (error) {
        console.error('Error al actualizar observaciones:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al actualizar las observaciones',
            error: error.message
        });
    }
});

// ============================================
// ELIMINAR DISPENSACIÓN (Solo administrador)
// ============================================
router.delete('/:id', verificarToken, verificarRol(['admin', 'administrador']), async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM dispensaciones WHERE id = :id';
        await sequelize.query(query, {
            replacements: { id },
            type: QueryTypes.DELETE
        });

        res.json({
            exito: true,
            mensaje: 'Dispensación eliminada correctamente'
        });

    } catch (error) {
        console.error('Error al eliminar dispensación:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al eliminar la dispensación',
            error: error.message
        });
    }
});

// ============================================
// ESTADÍSTICAS DE DISPENSACIONES
// ============================================
router.get('/estadisticas/general', verificarToken, verificarRol(['farmacia', 'admin', 'administrador']), async (req, res) => {
    try {
        // Total de dispensaciones
        const totalDispensaciones = await sequelize.query(
            'SELECT COUNT(*) as total FROM dispensaciones',
            { type: QueryTypes.SELECT }
        );

        // Dispensaciones por mes (últimos 6 meses)
        const dispensacionesPorMes = await sequelize.query(`
            SELECT 
                TO_CHAR("fechaDispensacion", 'YYYY-MM') as mes,
                COUNT(*) as total
            FROM dispensaciones
            WHERE "fechaDispensacion" >= NOW() - INTERVAL '6 months'
            GROUP BY mes
            ORDER BY mes DESC
        `, { type: QueryTypes.SELECT });

        // Medicamentos más dispensados
        const medicamentosMasDispensados = await sequelize.query(`
            SELECT 
                a.descripcion as medicamento,
                COUNT(d.id) as total_dispensaciones
            FROM dispensaciones d
            INNER JOIN autorizaciones a ON d."idAutorizacion" = a.id
            GROUP BY a.descripcion
            ORDER BY total_dispensaciones DESC
            LIMIT 10
        `, { type: QueryTypes.SELECT });

        // Dispensaciones del día
        const dispensacionesHoy = await sequelize.query(`
            SELECT COUNT(*) as total
            FROM dispensaciones
            WHERE DATE("fechaDispensacion") = CURRENT_DATE
        `, { type: QueryTypes.SELECT });

        res.json({
            exito: true,
            datos: {
                totalDispensaciones: totalDispensaciones[0].total,
                dispensacionesHoy: dispensacionesHoy[0].total,
                dispensacionesPorMes: dispensacionesPorMes,
                medicamentosMasDispensados: medicamentosMasDispensados
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al obtener las estadísticas',
            error: error.message
        });
    }
});

module.exports = router;