// ============================================
// 📄 middleware/authMiddleware.js (CORREGIDO)
// ============================================
const jwt = require('jsonwebtoken');

class AuthMiddleware {
    // ✅ Verificar token JWT
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

            console.log('✅ Token verificado:', {
                id: decoded.id,
                nombre: decoded.nombre,
                rol: decoded.rol
            });

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

    // ✅ Verificar si es administrador
    esAdministrador(req, res, next) {
        if (!req.usuario) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Usuario no autenticado'
            });
        }

        const rol = req.usuario.rol;
        console.log('🔍 Verificando administrador:', { rol });

        // ✅ CORRECCIÓN: Aceptar 'admin' y 'administrador'
        if (rol !== 'administrador' && rol !== 'admin') {
            return res.status(403).json({
                exito: false,
                mensaje: 'Acceso denegado. Se requiere rol de administrador.'
            });
        }

        next();
    }

    // ✅ Verificar si es médico
    esMedico(req, res, next) {
        if (!req.usuario) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Usuario no autenticado'
            });
        }

        const rol = req.usuario.rol;
        console.log('🔍 Verificando médico:', {
            rol,
            esDoctor: rol === 'doctor',
            esMedico: rol === 'medico'
        });

        // ✅ CORRECCIÓN CRÍTICA: Aceptar tanto 'doctor' como 'medico'
        if (rol !== 'doctor' && rol !== 'medico') {
            return res.status(403).json({
                exito: false,
                mensaje: 'Acceso denegado. Se requiere rol de médico.'
            });
        }

        next();
    }

    // ✅ Verificar si es paciente
    esPaciente(req, res, next) {
        if (!req.usuario) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Usuario no autenticado'
            });
        }

        const rol = req.usuario.rol;
        console.log('🔍 Verificando paciente:', { rol });

        if (rol !== 'paciente') {
            return res.status(403).json({
                exito: false,
                mensaje: 'Acceso denegado. Se requiere rol de paciente.'
            });
        }

        next();
    }

    // ✅ Versión clásica (compatible con rutas viejas)
    esAdmin(req, res, next) {
        if (!req.usuario || (req.usuario.rol !== 'admin' && req.usuario.rol !== 'administrador')) {
            return res.status(403).json({
                exito: false,
                mensaje: 'No autorizado (solo administradores)'
            });
        }
        next();
    }

    // ✅ Verificar si es médico O administrador (útil para algunas rutas)
    esMedicoOAdministrador(req, res, next) {
        if (!req.usuario) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Usuario no autenticado'
            });
        }

        const rol = req.usuario.rol;
        const esDoctor = rol === 'doctor' || rol === 'medico';
        const esAdmin = rol === 'admin' || rol === 'administrador';

        if (!esDoctor && !esAdmin) {
            return res.status(403).json({
                exito: false,
                mensaje: 'Acceso denegado. Se requiere rol de médico o administrador.'
            });
        }

        next();
    }

    // ✅ Versión flexible con array de roles
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

// Crear instancia
const auth = new AuthMiddleware();

// ✅ Exportar todos los métodos correctamente vinculados
module.exports = {
    // Métodos principales
    verificarToken: auth.verificarToken.bind(auth),
    esAdministrador: auth.esAdministrador.bind(auth),
    esMedico: auth.esMedico.bind(auth),
    esPaciente: auth.esPaciente.bind(auth),
    esAdmin: auth.esAdmin.bind(auth),
    esMedicoOAdministrador: auth.esMedicoOAdministrador.bind(auth),

    // Métodos adicionales (compatibilidad)
    autenticar: auth.verificarToken.bind(auth),
    verificarRol: auth.verificarRol.bind(auth)
};

// Log de carga
console.log('✅ authMiddleware cargado correctamente con todos los métodos');