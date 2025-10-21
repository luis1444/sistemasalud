// rutas/UsuarioRutas.js
const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controladores/UsuarioControlador');

// Registrar usuario
router.post('/registro', usuarioControlador.registrar);

module.exports = router;
