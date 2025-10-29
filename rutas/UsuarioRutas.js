// ============================================
// 📄 rutas/UsuarioRutas.js (AJUSTADO)
// ============================================
const express = require('express');
const router = express.Router();

// 💡 CONTROLADORES REQUERIDOS
const usuarioControlador = require('../Controladores/UsuarioControlador');
const AgendaControlador = require('../Controladores/AgendaControlador'); // ✅ Solución a ReferenceError

// 🔒 MIDDLEWARE
const authMiddleware = require('../middlewares/authMiddleware');
const { autenticar, verificarRol } = require('../middlewares/authMiddleware');

// ============================================
//  RUTAS PÚBLICAS
// ============================================
router.get('/', usuarioControlador.obtenerPorRol); // Ruta para /api/usuarios?rol=doctor
router.post('/registro', usuarioControlador.registrar);
router.post('/login', usuarioControlador.iniciarSesion);

// 🔄 Recuperación de contraseña
router.post('/recuperar-contrasena', usuarioControlador.solicitarRecuperacion);
router.post('/verificar-codigo', usuarioControlador.verificarCodigo);
router.post('/cambiar-contrasena', usuarioControlador.cambiarContrasenaRecuperacion);

// ============================================
// RUTAS PROTEGIDAS (Perfil del usuario autenticado)
// ============================================
router.get('/perfil', authMiddleware.verificarToken, usuarioControlador.obtenerPerfil);
router.put('/perfil', authMiddleware.verificarToken, usuarioControlador.actualizarPerfil);


// ============================================
// RUTAS ADMINISTRATIVAS / EXCLUSIVAS PARA ADMIN
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

// --------------------------------------------
//  RUTAS DE AGENDA (Prefijo /agendas)
// --------------------------------------------
// La URL final será /api/agendas (Si Server.js usa app.use('/api', router))
// La URL final será /api/usuarios/agendas (Si Server.js usa app.use('/api/usuarios', router))
router.get('/agendas', authMiddleware.verificarToken, authMiddleware.esAdmin, AgendaControlador.obtenerTodasLasAgendas);
router.get('/agendas/medico/:idMedico', authMiddleware.verificarToken, authMiddleware.esAdmin, AgendaControlador.obtenerAgendaMedico);
router.post('/agendas/medico/:idMedico', authMiddleware.verificarToken, authMiddleware.esAdmin, AgendaControlador.guardarAgendaMedico);
router.post('/agendas/auto-organizar', authMiddleware.verificarToken, authMiddleware.esAdmin, AgendaControlador.autoOrganizarAgendas);

// --------------------------------------------
//  RUTA DE UTILIDAD (Medicos)
// --------------------------------------------
// La URL final será /api/usuarios/medicos
router.get('/medicos', authMiddleware.verificarToken, authMiddleware.esAdmin, usuarioControlador.obtenerMedicos);


module.exports = router;