// ============================================
//  rutas/examenesRutas.js (NUEVO ARCHIVO)
// ============================================
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const ResultadosExamenesPDFControlador = require('../Controladores/ResultadosExamenesPDFControlador');

// ============================================
// 📄 RUTAS DE EXÁMENES PARA PACIENTES
// ============================================

// Descargar resultado de examen en PDF
// GET /api/examenes/:idExamen/descargar-pdf
router.get('/:idExamen/descargar-pdf',
    authMiddleware.verificarToken,
    authMiddleware.verificarRol(['paciente']),
    ResultadosExamenesPDFControlador.generarResultadoPDF
);

module.exports = router;