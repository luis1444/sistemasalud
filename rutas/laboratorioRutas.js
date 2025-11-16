
// ============================================
//  rutas/laboratorioRutas.js
// ============================================
const express = require('express');
const router = express.Router();
const laboratorioControlador = require('../Controladores/LaboratorioControlador');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware para verificar rol de laboratorio
const esLaboratorio = (req, res, next) => {
    console.log('🔍 Verificando rol de laboratorio:', {
        rol: req.usuario.rol,
        usuario: req.usuario.nombre
    });

    // CAMBIO: Aceptar múltiples roles válidos para laboratorio
    const rolesValidos = ['laboratorio', 'tecnico', 'tecnico_laboratorio'];

    if (!rolesValidos.includes(req.usuario.rol)) {
        return res.status(403).json({
            exito: false,
            mensaje: `Acceso denegado. Rol actual: ${req.usuario.rol}. Se requiere rol de laboratorio.`
        });
    }
    next();
};

// ============================================
// 📋 RUTAS DE LABORATORIO
// ============================================

// Obtener exámenes pendientes
// GET /api/laboratorio/examenes-pendientes
router.get('/examenes-pendientes',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.obtenerExamenesPendientes
);

// Obtener exámenes en proceso
// GET /api/laboratorio/examenes-en-proceso
router.get('/examenes-en-proceso',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.obtenerExamenesEnProceso
);

// Obtener historial de exámenes
// GET /api/laboratorio/historial?periodo=mes
router.get('/historial',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.obtenerHistorial
);

// Iniciar procesamiento de un examen
// PUT /api/laboratorio/examenes/:idExamen/iniciar
router.put('/examenes/:idExamen/iniciar',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.iniciarProcesamiento
);

// Completar examen y registrar resultados
// PUT /api/laboratorio/examenes/:idExamen/completar
router.put('/examenes/:idExamen/completar',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.completarExamen
);

// Obtener estadísticas del laboratorio
// GET /api/laboratorio/estadisticas
router.get('/estadisticas',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.obtenerEstadisticas
);

module.exports = router;