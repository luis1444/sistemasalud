// Controladores/AdministradorControlador.js

const express = require("express");
const router = express.Router();
const adminService = require("../servicios/AdministradorServicios");

router.post("/registrar", (req, res) => {
    try {
        const { nombre, correo, password } = req.body;
        const nuevo = adminService.registrarAdministrador(nombre, correo, password);
        res.status(201).json(nuevo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/asignarRol", (req, res) => {
    try {
        const { correo, rol } = req.body;
        const adminActualizado = adminService.asignarRol(correo, rol);
        res.status(200).json(adminActualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get("/listar", (req, res) => {
    try {
        const lista = adminService.obtenerAdministradores();
        res.status(200).json(lista);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
