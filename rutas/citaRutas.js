// ============================================
// 📄 rutas/citaRutas.js — Rutas de Citas
// ============================================
const express = require('express');
const router = express.Router();
const citaControlador = require('../controladores/CitaControlador');
const authMiddleware = require('../middlewares/authMiddleware');
const citaServicio = require('../servicios/CitaServicio');

// ============================================
// 📋 RUTAS DE CITAS
// ============================================

// Obtener citas de un médico
// GET /api/citas/doctor/:idMedico (para compatibilidad con frontend)
// GET /api/citas/medico/:idMedico
router.get('/doctor/:idMedico',
    authMiddleware.verificarToken,
    citaControlador.obtenerCitasMedico
);

router.get('/medico/:idMedico',
    authMiddleware.verificarToken,
    citaControlador.obtenerCitasMedico
);

// ✅ NUEVO: Obtener mis citas (paciente autenticado desde el token)
// GET /api/citas/mis-citas
router.get('/mis-citas',
    authMiddleware.verificarToken,
    citaControlador.obtenerMisCitas
);

// Obtener citas del paciente autenticado (alternativa)
// GET /api/citas/paciente
router.get('/paciente',
    authMiddleware.verificarToken,
    citaControlador.obtenerMisCitas
);

// Obtener citas de un paciente específico (por ID)
// GET /api/citas/paciente/:idPaciente
router.get('/paciente/:idPaciente',
    authMiddleware.verificarToken,
    citaControlador.obtenerCitasPaciente
);

// Obtener citas disponibles de un médico en una fecha
// GET /api/citas/disponibles/:idMedico/:fecha
router.get('/disponibles/:idMedico/:fecha',
    authMiddleware.verificarToken,
    citaControlador.obtenerCitasDisponibles
);

// Reservar una cita
// POST /api/citas/:idCita/reservar
router.post('/:idCita/reservar',
    authMiddleware.verificarToken,
    citaControlador.reservarCita
);

// Cancelar una cita
// PUT /api/citas/:idCita/cancelar
router.put('/:idCita/cancelar',
    authMiddleware.verificarToken,
    citaControlador.cancelarCita
);

// Marcar cita como completada
// PUT /api/citas/:idCita/completar
router.put('/:idCita/completar',
    authMiddleware.verificarToken,
    citaControlador.completarCita
);

// Actualizar notas de una cita
// PUT /api/citas/:idCita/notas
router.put('/:idCita/notas',
    authMiddleware.verificarToken,
    citaControlador.actualizarNotas
);

// ============================================
// ✅ RUTAS DE ATENCIÓN MÉDICA
// ============================================

// Iniciar una cita (estado = 'en-curso')
// PUT /api/citas/:idCita/iniciar
router.put('/:idCita/iniciar',
    authMiddleware.verificarToken,
    async (req, res) => {
        try {
            const { idCita } = req.params;
            await citaServicio.iniciarCita(idCita);
            res.status(200).json({ mensaje: 'Cita iniciada correctamente' });
        } catch (error) {
            console.error('❌ Error en PUT /api/citas/:idCita/iniciar:', error);
            res.status(400).json({ mensaje: error.message || 'Error al iniciar la cita' });
        }
    }
);

// Finalizar una cita (estado = 'completada')
// PUT /api/citas/:idCita/finalizar
router.put('/:idCita/finalizar',
    authMiddleware.verificarToken,
    async (req, res) => {
        try {
            const { idCita } = req.params;
            const { notas } = req.body || {};
            await citaServicio.completarCita(idCita, notas);
            res.status(200).json({ mensaje: 'Cita finalizada correctamente' });
        } catch (error) {
            console.error('❌ Error en PUT /api/citas/:idCita/finalizar:', error);
            res.status(400).json({ mensaje: error.message || 'Error desconocido al finalizar la cita' });
        }
    }
);
const historialPDFControlador = require('../controladores/HistorialPDFControlador');

// Agregar esta ruta ANTES de las rutas con parámetros dinámicos
router.get('/historial/descargar-pdf',
    authMiddleware.verificarToken,
    historialPDFControlador.generarHistorialPDF
);


// ✅ NUEVO: Obtener mis citas (paciente autenticado desde el token)
// GET /api/citas/mis-citas
router.get('/mis-citas',
    authMiddleware.verificarToken,
    citaControlador.obtenerMisCitas
);

// ✅ NUEVO: Obtener mis exámenes de laboratorio (paciente autenticado)
// GET /api/citas/mis-examenes-laboratorio
router.get('/mis-examenes-laboratorio',
    authMiddleware.verificarToken,
    citaControlador.obtenerMisExamenesLaboratorio
);

// Obtener citas del paciente autenticado (alternativa)
// GET /api/citas/paciente
router.get('/paciente',
    authMiddleware.verificarToken,
    citaControlador.obtenerMisCitas
);

module.exports = router;