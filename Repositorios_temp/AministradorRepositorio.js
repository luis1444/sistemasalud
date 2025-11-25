// Repositorios/AdministradorRepositorio.js

const Administradores = [];

class AdministradorRepositorio {
    crear(admin) {
        Administradores.push(admin);
        return admin;
    }

    obtenerTodos() {
        return Administradores;
    }

    buscarPorCorreo(correo) {
        return Administradores.find(a => a.correo === correo);
    }

    actualizarRoles(correo, roles) {
        const admin = this.buscarPorCorreo(correo);
        if (admin) {
            admin.rolAsignado = roles;
            return admin;
        }
        return null;
    }
}

module.exports = new AdministradorRepositorio();
