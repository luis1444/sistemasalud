// ============================================
// 📄 rutas/agendaRutas.js — Rutas de Agenda
// ============================================
const express = require('express');
const router = express.Router();
const agendaControlador = require('../controladores/AgendaControlador');
const { autenticar, autorizarRoles } = require('../middlewares/auth');

// 📅 Obtener agenda de un médico específico
// GET /api/agendas/doctor/:idMedico
router.get('/doctor/:idMedico', autenticar, agendaControlador.obtenerAgendaMedico);

// 💾 Guardar/actualizar agenda de un médico (y generar citas automáticamente)
// POST /api/agendas/:idMedico
router.post('/:idMedico',
    autenticar,
    autorizarRoles(['admin', 'doctor']),
    agendaControlador.guardarAgendaMedico
);

// 🤖 Auto-organizar agendas (crear agendas por defecto para médicos sin agenda)
// POST /api/agendas/auto-organizar
router.post('/auto-organizar',
    autenticar,
    autorizarRoles(['admin']),
    agendaControlador.autoOrganizarAgendas
);

// 📋 Obtener todas las agendas
// GET /api/agendas
router.get('/',
    autenticar,
    autorizarRoles(['admin']),
    agendaControlador.obtenerTodasLasAgendas
);

module.exports = router;