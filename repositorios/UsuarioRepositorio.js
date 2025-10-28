// ============================================
// 📄 repositorios/UsuarioRepositorio.js
// ============================================
const Usuario = require('../entidades/Usuarios');
const { Op } = require('sequelize');

class UsuarioRepositorio {

    async crear(datos) {
        try {
            return await Usuario.create(datos);
        } catch (error) {
            console.error('❌ Error al crear usuario:', error);
            throw new Error('Error al crear el usuario en la base de datos');
        }
    }

    async buscarPorId(id) {
        try {
            return await Usuario.findByPk(id, {
                attributes: { exclude: ['contrasena'] }
            });
        } catch (error) {
            console.error('❌ Error al buscar por ID:', error);
            throw new Error('Error al buscar usuario');
        }
    }

    async buscarPorCorreo(correo) {
        try {
            return await Usuario.findOne({ where: { correo } });
        } catch (error) {
            console.error('❌ Error al buscar por correo:', error);
            throw new Error('Error al buscar usuario por correo');
        }
    }

    async existeCorreo(correo) {
        try {
            const usuario = await Usuario.findOne({ where: { correo } });
            return !!usuario;
        } catch (error) {
            console.error('❌ Error al verificar correo:', error);
            return false;
        }
    }

    // ✅ CORREGIDO: Maneja filtros incluso si vienen como URLSearchParams o similar
    async buscarTodos(filtros = {}) {
        try {
            const where = {};

            // Asegurar que filtros sea un objeto plano
            if (typeof filtros !== 'object' || filtros === null) {
                filtros = {};
            }

            // Convertir URLSearchParams (si viene así) a objeto
            if (typeof filtros.get === 'function') {
                const temp = {};
                for (const [key, value] of filtros.entries()) {
                    temp[key] = value;
                }
                filtros = temp;
            }

            // Filtro por rol
            if (filtros.rol) {
                where.rol = filtros.rol.toString().toLowerCase();
            }

            // Filtro por activo (maneja "true"/"false" como string)
            if (Object.prototype.hasOwnProperty.call(filtros, 'activo')) {
                if (filtros.activo === 'true' || filtros.activo === true) {
                    where.activo = true;
                } else if (filtros.activo === 'false' || filtros.activo === false) {
                    where.activo = false;
                }
            }

            // Filtro por especialidad
            if (filtros.especialidad) {
                where.especialidad = {
                    [Op.iLike]: `%${filtros.especialidad}%`
                };
            }

            const usuarios = await Usuario.findAll({
                where,
                attributes: { exclude: ['contrasena'] },
                order: [['fecha_creacion', 'DESC']]
            });

            return usuarios;
        } catch (error) {
            console.error('❌ Error en buscarTodos:', error);
            throw new Error('Error al consultar usuarios en la base de datos');
        }
    }

    async actualizar(id, datos) {
        try {
            const usuario = await Usuario.findByPk(id);
            if (!usuario) return null;

            if (datos.correo && datos.correo !== usuario.correo) {
                const existe = await this.existeCorreo(datos.correo);
                if (existe) throw new Error('El correo ya está registrado');
            }

            await usuario.update(datos);

            const usuarioActualizado = usuario.toJSON();
            delete usuarioActualizado.contrasena;
            return usuarioActualizado;
        } catch (error) {
            console.error('❌ Error al actualizar:', error);
            throw error;
        }
    }

    async desactivar(id) {
        try {
            return await this.actualizar(id, { activo: false });
        } catch (error) {
            console.error('❌ Error al desactivar:', error);
            throw error;
        }
    }

    async contarPorRol(rol) {
        try {
            return await Usuario.count({
                where: { rol: rol.toLowerCase(), activo: true }
            });
        } catch (error) {
            console.error('❌ Error al contar por rol:', error);
            return 0;
        }
    }

    async obtenerMedicosConAgenda() {
        try {
            const medicos = await Usuario.findAll({
                where: { rol: 'doctor', activo: true },
                attributes: { exclude: ['contrasena'] },
                order: [['nombre', 'ASC']]
            });

            return medicos;
        } catch (error) {
            console.error('❌ Error al obtener médicos:', error);
            throw new Error('Error al consultar médicos');
        }
    }
}

module.exports = new UsuarioRepositorio();
