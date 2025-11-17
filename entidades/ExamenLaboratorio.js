// ============================================
// entidades/ExamenLaboratorio.js
// ============================================
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
        type: DataTypes.ENUM(
            'pendiente',
            'muestra-tomada',
            'en-analisis',
            'en-proceso',
            'completado',
            'cancelado'
        ),
        allowNull: false,
        defaultValue: 'pendiente'
    },

    // ============================================
    // DATOS DE TOMA DE MUESTRA
    // ============================================
    tipo_muestra: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Tipo de muestra (sangre, orina, heces, etc.)'
    },
    codigo_muestra: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'Código único de identificación de la muestra'
    },
    fecha_toma_muestra: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora de toma de muestra'
    },
    condicion_muestra: {
        type: DataTypes.ENUM('optima', 'aceptable', 'suboptima'),
        allowNull: true,
        defaultValue: 'optima',
        comment: 'Condición de la muestra al momento de tomarla'
    },
    observaciones_toma: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones durante la toma de muestra'
    },

    // ============================================
    // DATOS DE ANÁLISIS
    // ============================================
    fecha_inicio_analisis: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora de inicio del análisis'
    },
    metodo_analisis: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'automatizado',
        comment: 'Método utilizado para el análisis (automatizado, manual, mixto)'
    },
    notas_inicio_analisis: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas técnicas al iniciar el análisis'
    },

    // ============================================
    // DATOS DE PROCESAMIENTO (Compatibilidad)
    // ============================================
    fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha de inicio de procesamiento (campo legacy)'
    },

    // ============================================
    // RESULTADOS FINALES
    // ============================================
    fecha_realizacion: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha de finalización y entrega de resultados'
    },
    resultado: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Resultados del examen de laboratorio'
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones finales sobre los resultados'
    },
    estado_resultado: {
        type: DataTypes.ENUM('normal', 'anormal', 'critico'),
        allowNull: true,
        comment: 'Clasificación del resultado del examen'
    }
}, {
    tableName: 'examenes_laboratorio',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Workflow de exámenes de laboratorio: pendiente -> muestra-tomada -> en-analisis -> completado'
});

// ⚠️ NO DEFINIR ASOCIACIONES AQUÍ
// Las asociaciones se definen en entidades/asociaciones.js

module.exports = ExamenLaboratorio;