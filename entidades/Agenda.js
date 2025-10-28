// ============================================
// 📄 entidades/Agenda.js — Modelo Sequelize (CORREGIDO)
// ============================================
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/database');
// ❌ ELIMINADA: Ya no se requiere el modelo Usuario aquí.
// const Usuario = require('./Usuarios');

const Agenda = sequelize.define('Agenda', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_medico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            // Se usa el nombre de la tabla, NO el modelo.
            model: 'usuarios',
            key: 'id'
        },
        unique: true
    },
    dias_disponibles: {
        // Usar TEXT o STRING para compatibilidad con muchos SGBD si usas ARRAY(STRING)
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    hora_inicio_manana: {
        type: DataTypes.TIME,
        allowNull: true
    },
    hora_fin_manana: {
        type: DataTypes.TIME,
        allowNull: true
    },
    hora_inicio_tarde: {
        type: DataTypes.TIME,
        allowNull: true
    },
    hora_fin_tarde: {
        type: DataTypes.TIME,
        allowNull: true
    },
    duracion_cita_minutos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30
    }
}, {
    tableName: 'agendas',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
});

// ❌ ELIMINADAS: La definición de asociaciones se mueve a un archivo central.
// Usuario.hasOne(Agenda, { foreignKey: 'id_medico', as: 'agenda' });
// Agenda.belongsTo(Usuario, { foreignKey: 'id_medico', as: 'medico' });

module.exports = Agenda;