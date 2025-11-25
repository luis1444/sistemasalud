// ============================================
// 📄 rutas/agendaRutas.js — Rutas de Agenda (CORREGIDO)
// ============================================
const express = require('express');
const router = express.Router();
const agendaControlador = require('../Controladores/AgendaControlador');
const authMiddleware = require('../middlewares/authMiddleware');

// ============================================
// 📅 RUTAS DE AGENDA
// ============================================

// 📋 Obtener todas las agendas (Solo admin)
// GET /api/agendas
router.get('/',
    authMiddleware.verificarToken,
    authMiddleware.esAdmin,
    agendaControlador.obtenerTodasLasAgendas
);

// 📅 Obtener agenda de un médico específico
// GET /api/agendas/doctor/:idMedico
router.get('/doctor/:idMedico',
    authMiddleware.verificarToken,
    agendaControlador.obtenerAgendaMedico
);

// 💾 Guardar/actualizar agenda de un médico (y generar citas automáticamente)
// POST /api/agendas/:idMedico
router.post('/:idMedico',
    authMiddleware.verificarToken,
    authMiddleware.esAdmin,
    agendaControlador.guardarAgendaMedico
);

// 🤖 Auto-organizar agendas (crear agendas por defecto para médicos sin agenda)
// POST /api/agendas/auto-organizar
router.post('/auto-organizar',
    authMiddleware.verificarToken,
    authMiddleware.esAdmin,
    agendaControlador.autoOrganizarAgendas
);

module.exports = router;