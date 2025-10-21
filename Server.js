require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { sequelize, testConnection } = require('./Config/database'); // conexión Sequelize

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 🔧 Middlewares
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// 🌐 Archivos estáticos (Frontend)
// ============================================
// Sirve TODO lo que esté en /public (incluye Vistas, css, js, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// 🧩 Rutas de API
// ============================================
const usuarioRutas = require('./rutas/UsuarioRutas');
app.use('/api/usuarios', usuarioRutas); // Ej: /api/usuarios/login

// ============================================
// 🏠 Rutas del Frontend
// ============================================

// Página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Vistas', 'index.html'));
});

// Página de inicio de sesión
app.get('/inicio-sesion', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Vistas', 'login.html'));
});

// ============================================
// 🚀 Iniciar servidor y sincronizar base de datos
// ============================================
app.listen(PORT, async () => {
    console.log(`✅ Servidor VITAL+ corriendo en: http://localhost:${PORT}`);

    // 1️⃣ Verificar conexión
    await testConnection();

    try {
        console.log('🔄 Sincronizando base de datos...');
        // 2️⃣ Cargar modelo Usuario (para registrar su estructura)
        require('./entidades/Usuarios');

        // 3️⃣ Crear o actualizar tablas automáticamente
        await sequelize.sync({ alter: true });
        console.log('✅ Tablas sincronizadas correctamente.');
    } catch (error) {
        console.error('❌ Error al sincronizar la base de datos:', error);
    }
});
