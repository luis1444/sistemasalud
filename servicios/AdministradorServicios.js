// Servicios/AdministradorServicios.js

const Administrador = require("../entidades/Administrador");
const adminRepo = require("../repositorios/AdministradorRepositorio");

class AdministradorServicios {
    registrarAdministrador(nombre, correo, password) {
        const existente = adminRepo.buscarPorCorreo(correo);
        if (existente) throw new Error("El administrador ya existe");

        const nuevoAdmin = new Administrador(
            Date.now(),
            nombre,
            correo,
            password,
            []
        );

        return adminRepo.crear(nuevoAdmin);
    }

    asignarRol(correo, rol) {
        const admin = adminRepo.buscarPorCorreo(correo);
        if (!admin) throw new Error("Administrador no encontrado");

        admin.asignarRol(rol);
        return adminRepo.actualizarRoles(correo, admin.rolAsignado);
    }

    obtenerAdministradores() {
        return adminRepo.obtenerTodos();
    }
}

module.exports = new AdministradorServicios();
