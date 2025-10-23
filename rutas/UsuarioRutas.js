// ============================================
// 📄 rutas/UsuarioRutas.js
// ============================================
const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controladores/UsuarioControlador');
const authMiddleware = require('../middleware/authMiddleware');

// 🟢 Rutas públicas
router.get('/usuarios', usuarioControlador.obtenerPorRol);
router.post('/registro', usuarioControlador.registrar);
router.post('/login', usuarioControlador.iniciarSesion);

// 🟡 Rutas protegidas (requieren autenticación)
router.get('/perfil', authMiddleware.verificarToken, usuarioControlador.obtenerPerfil);
router.put('/perfil', authMiddleware.verificarToken, usuarioControlador.actualizarPerfil);

// 🟣 Rutas exclusivas para administradores
router.post('/crear-personal', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.crearPersonal);
router.get('/listar', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.obtenerTodos);
router.get('/estadisticas', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.obtenerEstadisticas);
router.put('/:id', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.actualizarUsuario);
router.delete('/:id', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.desactivarUsuario);
router.post('/:id/activar', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.activarUsuario);

// 🆕 Nueva ruta para filtrar usuarios por rol (ej: /api/usuarios?rol=doctor)
router.get('/', authMiddleware.verificarToken, usuarioControlador.obtenerPorRol);

// 🟢 Recuperación de contraseña
router.post('/recuperar-contrasena', usuarioControlador.solicitarRecuperacion);
router.post('/verificar-codigo', usuarioControlador.verificarCodigo);
router.post('/cambiar-contrasena', usuarioControlador.cambiarContrasenaRecuperacion);

module.exports = router;
