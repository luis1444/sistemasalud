// ============================================
//  rutas/medicoRutas.js
// ============================================
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const MedicoExamenesControlador = require('../controladores/MedicoExamenesControlador');

// ============================================
// 📋 RUTAS DE EXÁMENES PARA MÉDICOS
// ============================================

// Obtener paciente y sus exámenes por documento
// GET /api/medico/paciente-examenes/:documento
router.get('/paciente-examenes/:documento',
    authMiddleware.verificarToken,
    authMiddleware.verificarRol(['medico', 'doctor']),
    MedicoExamenesControlador.obtenerPacienteYExamenes
);

// Descargar PDF de resultado de examen
// GET /api/medico/examenes/:idExamen/descargar-pdf
router.get('/examenes/:idExamen/descargar-pdf',
    authMiddleware.verificarToken,
    authMiddleware.verificarRol(['medico', 'doctor']),
    MedicoExamenesControlador.descargarResultadoPDF
);

module.exports = router;