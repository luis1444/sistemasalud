
const usuarioServicio = require('../servicios/UsuarioServicios');

class UsuarioControlador {

    async registrar(req, res) {
        try {
            const { correo, contrasena, rol } = req.body;
            if (!correo || !contrasena)
                return res.status(400).json({ exito: false, mensaje: 'Correo y contraseña son obligatorios' });

            const usuario = await usuarioServicio.registrar({ correo, contrasena, rol });
            res.status(201).json({
                exito: true,
                mensaje: 'Usuario registrado correctamente',
                datos: { usuario }  // <-- esto es lo que tu frontend espera
            });
        } catch (error) {
            res.status(400).json({ exito: false, mensaje: error.message });
        }
    }

    async iniciarSesion(req, res) {
        try {
            const { correo, contrasena } = req.body;
            const resultado = await usuarioServicio.iniciarSesion(correo, contrasena);
            res.json({ exito: true, mensaje: 'Inicio de sesión exitoso', datos: resultado });
        } catch (error) {
            res.status(401).json({ exito: false, mensaje: error.message });
        }
    }

    async obtenerPerfil(req, res) {
        try {
            const usuario = await usuarioServicio.obtenerPerfil(req.usuario.id);
            res.json({ exito: true, datos: usuario });
        } catch (error) {
            res.status(404).json({ exito: false, mensaje: error.message });
        }
    }

    async obtenerTodos(req, res) {
        try {
            const filtros = req.query;
            const usuarios = await usuarioServicio.obtenerTodos(filtros);
            res.json({ exito: true, total: usuarios.length, datos: usuarios });
        } catch (error) {
            res.status(500).json({ exito: false, mensaje: error.message });
        }
    }

    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const usuario = await usuarioServicio.actualizar(id, req.body);
            res.json({ exito: true, mensaje: 'Usuario actualizado', datos: usuario });
        } catch (error) {
            res.status(400).json({ exito: false, mensaje: error.message });
        }
    }
}

module.exports = new UsuarioControlador();
