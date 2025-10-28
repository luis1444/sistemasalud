// ============================================
// 📄 middleware/authMiddleware.js (UNIFICADO)
// ============================================
const jwt = require('jsonwebtoken');

class AuthMiddleware {
    // ✅ Versión mejorada y compatible de verificarToken/autenticar
    verificarToken(req, res, next) {
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

    // ✅ Versión clásica (compatible con tus rutas viejas)
    esAdmin(req, res, next) {
        if (!req.usuario || req.usuario.rol !== 'admin') {
            return res.status(403).json({
                exito: false,
                mensaje: 'No autorizado (solo administradores)'
            });
        }
        next();
    }

    // ✅ Versión nueva (compatible con verificarRol(['admin']))
    verificarRol(roles = []) {
        return (req, res, next) => {
            if (!req.usuario) {
                return res.status(401).json({
                    exito: false,
                    mensaje: 'Usuario no autenticado'
                });
            }

            if (!roles.includes(req.usuario.rol)) {
                return res.status(403).json({
                    exito: false,
                    mensaje: 'Acceso denegado para este rol'
                });
            }

            next();
        };
    }
}

// Exportar instancia y también versión directa del middleware
const auth = new AuthMiddleware();

// ✅ Para compatibilidad con ambas versiones:
module.exports = auth;                   // → Para usar: authMiddleware.verificarToken
module.exports.autenticar = auth.verificarToken.bind(auth);  // → Para usar: autenticar
module.exports.verificarRol = auth.verificarRol.bind(auth);  // → Para usar: verificarRol
