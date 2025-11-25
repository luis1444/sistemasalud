// ============================================
// 📄 database.js — conexión Sequelize a PostgreSQL
// ============================================
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración para desarrollo y producción
const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (isProduction && process.env.DATABASE_URL) {
    // Configuración para Render usando DATABASE_URL
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false,
        pool: {
            max: 20,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
} else {
    // Configuración para desarrollo local
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'postgres',
            logging: false,
            pool: {
                max: 20,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
}

// Probar conexión
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida correctamente');
        console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error);
        process.exit(1);
    }
};

// Exporta tanto la conexión como la función
module.exports = { sequelize, testConnection };