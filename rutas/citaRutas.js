// ============================================
//  rutas/citaRutas.js — Rutas de Citas
// ============================================
const express = require('express');
const router = express.Router();
const citaControlador = require('../controladores/CitaControlador');
const authMiddleware = require('../middlewares/authMiddleware');

// ============================================
//  RUTAS DE CITAS
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

//  Obtener citas de un paciente
// GET /api/citas/paciente/:idPaciente
router.get('/paciente/:idPaciente',
    authMiddleware.verificarToken,
    citaControlador.obtenerCitasPaciente
);

//  Obtener citas disponibles de un médico en una fecha
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

//  Cancelar una cita
// PUT /api/citas/:idCita/cancelar
router.put('/:idCita/cancelar',
    authMiddleware.verificarToken,
    citaControlador.cancelarCita
);

// ✔Marcar cita como completada
// PUT /api/citas/:idCita/completar
router.put('/:idCita/completar',
    authMiddleware.verificarToken,
    citaControlador.completarCita
);

//  Actualizar notas de una cita
// PUT /api/citas/:idCita/notas
router.put('/:idCita/notas',
    authMiddleware.verificarToken,
    citaControlador.actualizarNotas
);

module.exports = router;