// ============================================
// 📄 entidades/Autorizacion.js (CORREGIDO)
// ============================================
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Autorizacion = sequelize.define('Autorizacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_cita: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'citas',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    id_medico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    id_paciente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    tipo: {
        type: DataTypes.ENUM('medicamento', 'examen'),
        allowNull: false,
        comment: 'Tipo de autorización: medicamento o examen médico'
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Descripción del medicamento o examen solicitado'
    },
    justificacion: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Justificación médica de la solicitud'
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'),
        defaultValue: 'pendiente',
        allowNull: false
    },
    prioridad: {
        type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
        defaultValue: 'media',
        allowNull: false
    },
    fecha_solicitud: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    fecha_respuesta: {
        type: DataTypes.DATE,
        allowNull: true
    },
    id_aprobador: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'ID del administrador que aprobó/rechazó'
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones del administrador al aprobar/rechazar'
    },
    cantidad: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Cantidad de medicamento o número de estudios'
    },
    duracion_tratamiento: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Duración del tratamiento (solo para medicamentos)'
    }
}, {
    tableName: 'autorizaciones',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // 🔧 OPCIONES CRÍTICAS PARA SINCRONIZACIÓN
    freezeTableName: true, // No pluralizar el nombre
    underscored: true      // Usar snake_case
});

module.exports = Autorizacion;