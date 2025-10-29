// ============================================
// 📄 middlewares/auth.js (Archivo de Exportación Simplificado)
// ============================================
const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar el token JWT
 */
function autenticar(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Token no proporcionado'
            });
        }

        // Extraer token del formato "Bearer TOKEN"
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Formato de token inválido'
            });
        }

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vital_plus_secret');

        // Guardar los datos del usuario autenticado
        req.usuario = decoded;

        next();
    } catch (error) {
        console.error('❌ Error en autenticación:', error.message);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                exito: false,
                mensaje: 'Token inválido'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                exito: false,
                mensaje: 'Token expirado'
            });
        }

        return res.status(500).json({
            exito: false,
            mensaje: 'Error en la autenticación'
        });
    }
}

/**
 * Middleware para verificar roles específicos
 * @param {Array<string>} rolesPermitidos - Array de roles permitidos
 */
function autorizarRoles(rolesPermitidos = []) {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Usuario no autenticado'
            });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                exito: false,
                mensaje: `Acceso denegado. Se requiere uno de estos roles: ${rolesPermitidos.join(', ')}`
            });
        }

        next();
    };
}

/**
 * Middleware para verificar si es administrador
 */
function esAdmin(req, res, next) {
    if (!req.usuario || req.usuario.rol !== 'admin') {
        return res.status(403).json({
            exito: false,
            mensaje: 'Acceso denegado. Solo administradores.'
        });
    }
    next();
}

/**
 * Middleware para verificar si es médico
 */
function esMedico(req, res, next) {
    if (!req.usuario || req.usuario.rol !== 'doctor') {
        return res.status(403).json({
            exito: false,
            mensaje: 'Acceso denegado. Solo médicos.'
        });
    }
    next();
}

/**
 * Middleware para verificar si es paciente
 */
function esPaciente(req, res, next) {
    if (!req.usuario || req.usuario.rol !== 'paciente') {
        return res.status(403).json({
            exito: false,
            mensaje: 'Acceso denegado. Solo pacientes.'
        });
    }
    next();
}

// ✅ Exportar todos los middlewares
module.exports = {
    autenticar,
    autorizarRoles,
    esAdmin,
    esMedico,
    esPaciente,
    // Alias para compatibilidad
    verificarToken: autenticar,
    verificarRol: autorizarRoles
};