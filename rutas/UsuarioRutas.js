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
// 🔑 CORREGIDO: Llama a la función específica para actualizar el perfil del usuario autenticado
router.put('/perfil', authMiddleware.verificarToken, usuarioControlador.actualizarPerfil);

// Rutas exclusivas para administradores
router.post('/crear-personal', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.crearPersonal);
router.get('/listar', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.obtenerTodos);
router.get('/estadisticas', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.obtenerEstadisticas);
// 🔑 PERMANECE IGUAL: Llama a la función para actualizar un usuario por ID (Admin)
router.put('/:id', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.actualizarUsuario);
router.delete('/:id', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.desactivarUsuario);
router.post('/:id/activar', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.activarUsuario);

router.post('/recuperar-contrasena', usuarioControlador.solicitarRecuperacion);
router.post('/verificar-codigo', usuarioControlador.verificarCodigo);
router.post('/cambiar-contrasena', usuarioControlador.cambiarContrasenaRecuperacion);


module.exports = router;