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

// GET /api/usuarios/buscar-identificacion/:identificacion
router.get('/buscar-identificacion/:identificacion',
    authMiddleware.verificarToken,
    authMiddleware.verificarRol(['doctor', 'admin']), // Solo doctores y admins pueden buscar
    async (req, res) => {
        try {
            const { identificacion } = req.params;

            // Buscar en el repositorio de usuarios
            const usuario = await Usuario.findOne({
                where: {
                    identificacion: identificacion,
                    rol: 'paciente' // Solo buscar pacientes
                },
                attributes: ['id', 'nombre', 'correo', 'telefono', 'identificacion', 'fecha_nacimiento', 'genero']
            });

            if (!usuario) {
                return res.status(404).json({
                    exito: false,
                    mensaje: 'Paciente no encontrado con ese número de identificación'
                });
            }

            res.status(200).json(usuario);
        } catch (error) {
            console.error('❌ Error al buscar usuario por identificación:', error);
            res.status(500).json({
                exito: false,
                mensaje: 'Error al buscar el paciente',
                error: error.message
            });
        }
    }
);

module.exports = router;