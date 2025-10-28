// ============================================
// 📄 rutas/UsuarioRutas.js (UNIFICADO y FUNCIONAL)
// ============================================
const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controladores/UsuarioControlador');


const authMiddleware = require('../middleware/authMiddleware');
const { autenticar, verificarRol } = require('../middleware/authMiddleware');

// ============================================
//  RUTAS PÚBLICAS
// ============================================
router.get('/usuarios', usuarioControlador.obtenerPorRol);
router.post('/registro', usuarioControlador.registrar);
router.post('/login', usuarioControlador.iniciarSesion);

// 🔄 Recuperación de contraseña
router.post('/recuperar-contrasena', usuarioControlador.solicitarRecuperacion);
router.post('/verificar-codigo', usuarioControlador.verificarCodigo);
router.post('/cambiar-contrasena', usuarioControlador.cambiarContrasenaRecuperacion);

// ============================================
// RUTAS PROTEGIDAS (Perfil del usuario autenticado)
// ============================================
// → Ambas versiones siguen funcionando (usan el mismo middleware unificado)
router.get('/perfil', authMiddleware.verificarToken, usuarioControlador.obtenerPerfil);
router.put('/perfil', authMiddleware.verificarToken, usuarioControlador.actualizarPerfil);

// Alternativa (por compatibilidad con el segundo código)
router.get('/perfil', autenticar, usuarioControlador.obtenerPerfil);
router.put('/perfil', autenticar, usuarioControlador.actualizarPerfil);

// ============================================
// RUTAS ADMINISTRATIVAS / EXCLUSIVAS PARA ADMIN
// ============================================

// Versión original (usa esAdmin)
router.post(
    '/crear-personal',
    authMiddleware.verificarToken,
    authMiddleware.esAdmin,
    usuarioControlador.crearPersonal
);
router.get(
    '/listar',
    authMiddleware.verificarToken,
    authMiddleware.esAdmin,
    usuarioControlador.obtenerTodos
);
router.get(
    '/estadisticas',
    authMiddleware.verificarToken,
    authMiddleware.esAdmin,
    usuarioControlador.obtenerEstadisticas
);
router.put(
    '/:id',
    authMiddleware.verificarToken,
    authMiddleware.esAdmin,
    usuarioControlador.actualizarUsuario
);
router.delete(
    '/:id',
    authMiddleware.verificarToken,
    authMiddleware.esAdmin,
    usuarioControlador.desactivarUsuario
);
router.post(
    '/:id/activar',
    authMiddleware.verificarToken,
    authMiddleware.esAdmin,
    usuarioControlador.activarUsuario
);

//  Versión nueva (usa verificarRol)
router.get(
    '/',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.obtenerTodos
);
router.get(
    '/medicos',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.obtenerMedicos
);
router.get(
    '/estadisticas',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.obtenerEstadisticas
);
router.post(
    '/personal',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.crearPersonal
);
router.put(
    '/:id',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.actualizarUsuario
);
router.patch(
    '/:id/desactivar',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.desactivarUsuario
);
router.patch(
    '/:id/activar',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.activarUsuario
);

// ============================================
//  RUTA PARA FILTRAR POR ROL
// ============================================
router.get('/', authMiddleware.verificarToken, usuarioControlador.obtenerPorRol);

module.exports = router;
