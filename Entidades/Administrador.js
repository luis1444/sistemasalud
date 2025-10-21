// Entidades/Administrador.js

class Administrador {
    constructor(id, nombre, correo, password, rolAsignado = []) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.password = password;
        this.rolAsignado = rolAsignado; // Ej: ["medico", "laboratorio", "farmacia"]
    }

    asignarRol(nuevoRol) {
        if (!["medico", "laboratorio", "farmacia"].includes(nuevoRol)) {
            throw new Error("Rol no válido");
        }
        if (!this.rolAsignado.includes(nuevoRol)) {
            this.rolAsignado.push(nuevoRol);
        }
    }

    eliminarRol(rol) {
        this.rolAsignado = this.rolAsignado.filter(r => r !== rol);
    }
}

module.exports = Administrador;
