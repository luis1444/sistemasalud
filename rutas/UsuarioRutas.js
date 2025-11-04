// ============================================
// 📄 rutas/UsuarioRutas.js (CORREGIDO)
// ============================================
const express = require('express');
const router = express.Router();

// 💡 CONTROLADORES REQUERIDOS
const usuarioControlador = require('../Controladores/UsuarioControlador');

// 🔒 MIDDLEWARE
const authMiddleware = require('../middlewares/authMiddleware');
const { autenticar, verificarRol } = require('../middlewares/authMiddleware');

// ============================================
// 🌐 RUTAS PÚBLICAS
// ============================================
router.get('/', usuarioControlador.obtenerPorRol); // Ruta para /api/usuarios?rol=doctor
router.post('/registro', usuarioControlador.registrar);
router.post('/login', usuarioControlador.iniciarSesion);

// 🔄 Recuperación de contraseña
router.post('/recuperar-contrasena', usuarioControlador.solicitarRecuperacion);
router.post('/verificar-codigo', usuarioControlador.verificarCodigo);
router.post('/cambiar-contrasena', usuarioControlador.cambiarContrasenaRecuperacion);

// ============================================
// 🔒 RUTAS PROTEGIDAS (Perfil del usuario autenticado)
// ============================================
router.get('/perfil', authMiddleware.verificarToken, usuarioControlador.obtenerPerfil);
router.put('/perfil', authMiddleware.verificarToken, usuarioControlador.actualizarPerfil);

// ============================================
// 👨‍⚕️ RUTA DE UTILIDAD (Obtener médicos)
// ✅ CORRECCIÓN APLICADA AQUÍ: Se incluye el rol 'paciente' para la búsqueda.
// ============================================
router.get('/medicos', authMiddleware.verificarToken, verificarRol(['admin', 'paciente']), usuarioControlador.obtenerMedicos);

// ============================================
// 👑 RUTAS ADMINISTRATIVAS (Solo para ADMIN)
// ============================================
router.post(
    '/crear-personal',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.crearPersonal
);

router.get(
    '/listar',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.obtenerTodos
);

router.get(
    '/estadisticas',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.obtenerEstadisticas
);

// ✅ IMPORTANTE: Esta ruta debe ir DESPUÉS de las rutas específicas
// para evitar que /:id capture rutas como /perfil, /medicos, etc.
router.get(
    '/:id',
    autenticar,
    usuarioControlador.obtenerPorId
);

router.put(
    '/:id',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.actualizarUsuario
);

router.delete(
    '/:id',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.desactivarUsuario
);

router.post(
    '/:id/activar',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.activarUsuario
);

module.exports = router;