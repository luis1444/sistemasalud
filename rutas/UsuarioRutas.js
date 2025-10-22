// ============================================
// 📄 rutas/UsuarioRutas.js
// ============================================
const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controladores/UsuarioControlador');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/registro', usuarioControlador.registrar);
router.post('/login', usuarioControlador.iniciarSesion);

// Rutas protegidas (requieren autenticación)
router.get('/perfil', authMiddleware.verificarToken, usuarioControlador.obtenerPerfil);
router.put('/perfil', authMiddleware.verificarToken, usuarioControlador.actualizar);

// Rutas exclusivas para administradores
router.post('/crear-personal', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.crearPersonal);
router.get('/listar', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.obtenerTodos);
router.get('/estadisticas', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.obtenerEstadisticas);
router.put('/:id', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.actualizarUsuario);
router.delete('/:id', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.desactivarUsuario);
router.post('/:id/activar', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.activarUsuario);

module.exports = router;