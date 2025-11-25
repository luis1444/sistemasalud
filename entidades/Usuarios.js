// ============================================
// 📄 entidades/Usuarios.js — Modelo Sequelize
// ============================================
const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');

class Usuario extends Model {
    async verificarContrasena(contrasena) {
        return await bcrypt.compare(contrasena, this.contrasena);
    }

    async actualizarUltimoAcceso() {
        this.ultimo_acceso = new Date();
        await this.save();
    }
}

Usuario.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    identificacion: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    tipo_identificacion: {
        type: DataTypes.ENUM('registro_civil', 'tarjeta_identidad', 'cedula', 'cedula_extranjeria', 'pasaporte'),
        allowNull: true
    },
    nombre_padre: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Nombre del padre o tutor legal (para menores)'
    },
    fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    pais: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    ciudad: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    direccion: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    correo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    contrasena: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('paciente', 'doctor', 'admin', 'laboratorio', 'farmacia'),
        allowNull: false,
        defaultValue: 'paciente'
    },
    especialidad: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Para médicos: especialidad médica'
    },
    area: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Para laboratorio/farmacia: área de trabajo'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    ultimo_acceso: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: false
});

// 🔐 Encriptar contraseña antes de guardar
Usuario.beforeCreate(async (usuario) => {
    if (usuario.contrasena) {
        usuario.contrasena = await bcrypt.hash(usuario.contrasena, 10);
    }
});

// 🔐 Encriptar contraseña al actualizar
Usuario.beforeUpdate(async (usuario) => {
    if (usuario.changed('contrasena')) {
        usuario.contrasena = await bcrypt.hash(usuario.contrasena, 10);
    }
});

module.exports = Usuario;
