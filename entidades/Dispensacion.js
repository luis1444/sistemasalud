// ============================================
// 📄 entidades/Dispensacion.js
// ============================================
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // ✅ Config con C mayúscula

const Dispensacion = sequelize.define('Dispensacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idAutorizacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'autorizaciones',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    idFarmaceutico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    cantidad: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fechaDispensacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'dispensaciones',
    timestamps: false // Si no quieres createdAt/updatedAt automáticos
});

module.exports = Dispensacion;