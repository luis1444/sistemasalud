// ============================================
// 📄 repositorios/UsuarioRepositorio.js
// ============================================
const Usuario = require('../entidades/Usuarios');

class UsuarioRepositorio {

    async crear(datos) {
        return await Usuario.create(datos);
    }

    async buscarPorId(id) {
        return await Usuario.findByPk(id);
    }

    async buscarPorCorreo(correo) {
        return await Usuario.findOne({ where: { correo } });
    }

    async buscarTodos(filtros = {}) {
        const where = {};
        if (filtros.rol) where.rol = filtros.rol;
        if (filtros.activo !== undefined) where.activo = filtros.activo;

        return await Usuario.findAll({
            where,
            order: [['fecha_creacion', 'DESC']]
        });
    }

    async actualizar(id, datos) {
        const usuario = await this.buscarPorId(id);
        if (!usuario) return null;
        return await usuario.update(datos);
    }

    async desactivar(id) {
        const usuario = await this.buscarPorId(id);
        if (!usuario) return null;
        return await usuario.update({ activo: false });
    }

    async contarPorRol(rol) {
        return await Usuario.count({
            where: { rol, activo: true }
        });
    }

    async existeCorreo(correo) {
        const usuario = await this.buscarPorCorreo(correo);
        return !!usuario;
    }
}

module.exports = new UsuarioRepositorio();
