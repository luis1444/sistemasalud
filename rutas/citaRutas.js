// ============================================
// 📄 rutas/citaRutas.js — Rutas de Citas
// ============================================
const express = require('express');
const router = express.Router();
const citaControlador = require('../controladores/CitaControlador');
const { autenticar, autorizarRoles } = require('../middlewares/auth');

// 📅 Obtener citas de un médico
// GET /api/citas/medico/:idMedico
router.get('/medico/:idMedico',
    autenticar,
    citaControlador.obtenerCitasMedico
);

// 👤 Obtener citas de un paciente
// GET /api/citas/paciente/:idPaciente
router.get('/paciente/:idPaciente',
    autenticar,
    citaControlador.obtenerCitasPaciente
);

// 🔍 Obtener citas disponibles de un médico en una fecha
// GET /api/citas/disponibles/:idMedico/:fecha
router.get('/disponibles/:idMedico/:fecha',
    autenticar,
    citaControlador.obtenerCitasDisponibles
);

// ✅ Reservar una cita
// POST /api/citas/:idCita/reservar
router.post('/:idCita/reservar',
    autenticar,
    autorizarRoles(['paciente', 'admin']),
    citaControlador.reservarCita
);

// ❌ Cancelar una cita
// PUT /api/citas/:idCita/cancelar
router.put('/:idCita/cancelar',
    autenticar,
    citaControlador.cancelarCita
);

// ✔️ Marcar cita como completada
// PUT /api/citas/:idCita/completar
router.put('/:idCita/completar',
    autenticar,
    autorizarRoles(['doctor', 'admin']),
    citaControlador.completarCita
);

// 📝 Actualizar notas de una cita
// PUT /api/citas/:idCita/notas
router.put('/:idCita/notas',
    autenticar,
    autorizarRoles(['doctor', 'admin']),
    citaControlador.actualizarNotas
);

module.exports = router;