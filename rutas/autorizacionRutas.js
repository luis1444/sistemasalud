// ============================================
// 📄 rutas/autorizacionRutas.js
// ============================================
const express = require('express');
const router = express.Router();
const autorizacionControlador = require('../Controladores/AutorizacionControlador');
const authMiddleware = require('../middlewares/authMiddleware');

// ============================================
// 📋 RUTAS DE AUTORIZACIONES
// ============================================

// Crear una nueva autorización (médicos)
// POST /api/autorizaciones
router.post('/',
    authMiddleware.verificarToken,
    authMiddleware.esMedico,
    autorizacionControlador.crearAutorizacion
);

// Obtener todas las autorizaciones pendientes (administradores)
// GET /api/autorizaciones/pendientes
router.get('/pendientes',
    authMiddleware.verificarToken,
    authMiddleware.esAdministrador,
    autorizacionControlador.obtenerAutorizacionesPendientes
);

// Obtener estadísticas de autorizaciones (administradores)
// GET /api/autorizaciones/estadisticas
router.get('/estadisticas',
    authMiddleware.verificarToken,
    authMiddleware.esAdministrador,
    autorizacionControlador.obtenerEstadisticas
);

// Obtener mis autorizaciones como médico
// GET /api/autorizaciones/mis-solicitudes
router.get('/mis-solicitudes',
    authMiddleware.verificarToken,
    authMiddleware.esMedico,
    autorizacionControlador.obtenerMisAutorizaciones
);

// Obtener mis autorizaciones como paciente
// GET /api/autorizaciones/paciente
router.get('/paciente',
    authMiddleware.verificarToken,
    authMiddleware.esPaciente,
    autorizacionControlador.obtenerAutorizacionesPaciente
);

// Obtener una autorización por ID
// GET /api/autorizaciones/:idAutorizacion
router.get('/:idAutorizacion',
    authMiddleware.verificarToken,
    autorizacionControlador.obtenerAutorizacionPorId
);

// Aprobar una autorización (administradores)
// POST /api/autorizaciones/:idAutorizacion/aprobar
router.post('/:idAutorizacion/aprobar',
    authMiddleware.verificarToken,
    authMiddleware.esAdministrador,
    autorizacionControlador.aprobarAutorizacion
);

// Rechazar una autorización (administradores)
// POST /api/autorizaciones/:idAutorizacion/rechazar
router.post('/:idAutorizacion/rechazar',
    authMiddleware.verificarToken,
    authMiddleware.esAdministrador,
    autorizacionControlador.rechazarAutorizacion
);

module.exports = router;