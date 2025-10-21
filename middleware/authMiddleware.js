
const jwt = require('jsonwebtoken');

class AuthMiddleware {

    verificarToken(req, res, next) {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer '))
            return res.status(401).json({ exito: false, mensaje: 'Token no proporcionado' });

        const token = auth.split(' ')[1];
        try {
            req.usuario = jwt.verify(token, process.env.JWT_SECRET || 'vital_plus_secret');
            next();
        } catch {
            res.status(401).json({ exito: false, mensaje: 'Token inválido o expirado' });
        }
    }

    esAdmin(req, res, next) {
        if (req.usuario.rol !== 'admin')
            return res.status(403).json({ exito: false, mensaje: 'No autorizado' });
        next();
    }
}

module.exports = new AuthMiddleware();
