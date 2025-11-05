// ============================================
// 📄 entidades/Cita.js — Modelo Sequelize
// ============================================
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/database');

const Cita = sequelize.define('Cita', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_medico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    id_paciente: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false
    },
    hora_fin: {
        type: DataTypes.TIME,
        allowNull: false
    },
    duracion_cita_minutos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30
    },
    estado: {
        type: DataTypes.ENUM('disponible', 'programada', 'en-curso', 'completada', 'cancelada'),
        allowNull: false,
        defaultValue: 'disponible'
    },
    motivo_consulta: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'citas',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
});

module.exports = Cita;