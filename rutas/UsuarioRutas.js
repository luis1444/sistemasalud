// ============================================
// 📄 rutas/UsuarioRutas.js (CORREGIDO - COMPLETO)
// ============================================
const express = require('express');
const router = express.Router();

// ✅ CRÍTICO: Importar el modelo Usuario
const Usuario = require('../entidades/Usuarios');

// 💡 CONTROLADORES REQUERIDOS
const usuarioControlador = require('../controladores/UsuarioControlador');

// 🔒 MIDDLEWARE
const authMiddleware = require('../middlewares/authMiddleware');
const { autenticar, verificarRol } = require('../middlewares/authMiddleware');

// ============================================
// 🌐 RUTAS PÚBLICAS
// ============================================
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
// 🔍 RUTA DE BÚSQUEDA POR IDENTIFICACIÓN
// ✅ CRÍTICO: Esta ruta debe ir ANTES de /:id para evitar conflictos
// ============================================
router.get('/buscar-identificacion/:identificacion',
    authMiddleware.verificarToken,
    authMiddleware.verificarRol(['doctor', 'admin', 'farmacia']),
    async (req, res) => {
        try {
            const { identificacion } = req.params;

            console.log(`🔍 Buscando paciente con identificación: ${identificacion}`);

            // Buscar usuario por identificación
            const usuario = await Usuario.findOne({
                where: {
                    identificacion: identificacion,
                    rol: 'paciente' // Solo buscar pacientes
                },
                attributes: ['id', 'nombre', 'correo', 'telefono', 'identificacion',
                    'fecha_nacimiento', 'direccion', 'ciudad', 'pais',
                    'tipo_identificacion']
            });

            if (!usuario) {
                console.log(`❌ No se encontró paciente con identificación: ${identificacion}`);
                return res.status(404).json({
                    exito: false,
                    mensaje: 'Paciente no encontrado con ese número de identificación'
                });
            }

            console.log(`✅ Paciente encontrado: ${usuario.nombre} (ID: ${usuario.id})`);

            // Convertir a JSON para facilitar manipulación
            const usuarioJSON = usuario.toJSON();

            res.status(200).json({
                exito: true,
                ...usuarioJSON
            });

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

// ============================================
// 👨‍⚕️ RUTA DE UTILIDAD (Obtener médicos)
// ✅ También debe ir antes de /:id
// ============================================
router.get('/medicos',
    authMiddleware.verificarToken,
    verificarRol(['admin', 'paciente']),
    usuarioControlador.obtenerMedicos
);

// ============================================
// 📊 ESTADÍSTICAS (ADMIN)
// ✅ También debe ir antes de /:id
// ============================================
router.get('/estadisticas',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.obtenerEstadisticas
);

// ============================================
// 📋 LISTAR TODOS (ADMIN)
// ✅ También debe ir antes de /:id
// ============================================
router.get('/listar',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.obtenerTodos
);

// ============================================
// 👑 RUTAS ADMINISTRATIVAS (Solo para ADMIN)
// ============================================
router.post('/crear-personal',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.crearPersonal
);

// ============================================
// 📌 RUTAS CON PARÁMETRO :id
// ✅ IMPORTANTE: Estas rutas deben ir AL FINAL
// para evitar que /:id capture rutas específicas
// ============================================

// Obtener usuario por ID
router.get('/:id',
    autenticar,
    usuarioControlador.obtenerPorId
);

// Actualizar usuario
router.put('/:id',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.actualizarUsuario
);

// Desactivar usuario
router.delete('/:id',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.desactivarUsuario
);

// Activar usuario
router.post('/:id/activar',
    autenticar,
    verificarRol(['admin']),
    usuarioControlador.activarUsuario
);

// ============================================
// 🔍 RUTA GENERAL DE BÚSQUEDA (Si es necesaria)
// Esta debe estar al final también
// ============================================
router.get('/', usuarioControlador.obtenerPorRol); // Ruta para /api/usuarios?rol=doctor

module.exports = router;