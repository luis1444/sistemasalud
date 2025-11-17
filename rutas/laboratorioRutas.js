// ============================================
//  rutas/laboratorioRutas.js
// ============================================
const express = require('express');
const router = express.Router();
const laboratorioControlador = require('../Controladores/LaboratorioControlador');
const authMiddleware = require('../middlewares/authMiddleware');
const ResultadosExamenesPDFControlador = require('../Controladores/ResultadosExamenesPDFControlador');

// Middleware para verificar rol de laboratorio
const esLaboratorio = (req, res, next) => {
    console.log('🔍 Verificando rol de laboratorio:', {
        rol: req.usuario.rol,
        usuario: req.usuario.nombre
    });

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

// Obtener exámenes pendientes (sin muestra)
router.get('/examenes-pendientes',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.obtenerExamenesPendientes
);

// Obtener exámenes con muestra tomada
router.get('/examenes-con-muestra',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.obtenerExamenesConMuestra
);

// Obtener exámenes en análisis
router.get('/examenes-en-analisis',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.obtenerExamenesEnAnalisis
);

// Obtener exámenes en proceso (compatibilidad)
router.get('/examenes-en-proceso',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.obtenerExamenesEnProceso
);

// Obtener historial de exámenes
router.get('/historial',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.obtenerHistorial
);

// Registrar toma de muestra
router.put('/examenes/:idExamen/tomar-muestra',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.registrarTomaMuestra
);

// Iniciar análisis de muestra
router.put('/examenes/:idExamen/iniciar-analisis',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.iniciarAnalisis
);

// Iniciar procesamiento de un examen (compatibilidad)
router.put('/examenes/:idExamen/iniciar',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.iniciarProcesamiento
);

// Completar examen y registrar resultados
router.put('/examenes/:idExamen/completar',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.completarExamen
);

// Obtener estadísticas del laboratorio
router.get('/estadisticas',
    authMiddleware.verificarToken,
    esLaboratorio,
    laboratorioControlador.obtenerEstadisticas
);

// ============================================
// 📄 DESCARGAR PDF DE RESULTADO (PARA PACIENTES)
// ============================================
router.get('/examenes/:idExamen/descargar-pdf',
    authMiddleware.verificarToken,
    authMiddleware.verificarRol(['paciente']), // Solo pacientes pueden descargar sus propios resultados
    ResultadosExamenesPDFControlador.generarResultadoPDF
);

module.exports = router;