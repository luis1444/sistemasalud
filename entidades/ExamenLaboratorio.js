// ============================================
// entidades/ExamenLaboratorio.js
// ============================================
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // ⚠️ IMPORTANTE: destructurar sequelize

const ExamenLaboratorio = sequelize.define('ExamenLaboratorio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_autorizacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'autorizaciones',
            key: 'id'
        }
    },
    id_tecnico: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'en-proceso', 'completado'),
        defaultValue: 'pendiente'
    },
    resultado: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estado_resultado: {
        type: DataTypes.ENUM('normal', 'anormal', 'critico'),
        allowNull: true
    },
    fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: true
    },
    fecha_realizacion: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'examenes_laboratorio',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ExamenLaboratorio;