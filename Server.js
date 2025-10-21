
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { sequelize, testConnection } = require('./Config/database');
// 👈 importa tu conexión Sequelize

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 🔧 Middlewares
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde /public/Vistas
app.use(express.static(path.join(__dirname, 'public', 'Vistas')));

// ============================================
// 🌐 Rutas de API
// ============================================

// Importa tus rutas de usuario
const usuarioRutas = require('./rutas/UsuarioRutas');
app.use('/api/usuarios', usuarioRutas); // 👈 ahora /api/usuarios/registro funciona

// ============================================
// 🏠 Ruta principal (frontend)
// ============================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Vistas', 'index.html'));
});

// ============================================
// 🚀 Iniciar servidor
// ============================================
app.listen(PORT, async () => {
    console.log(`✅ Servidor VITAL+ corriendo en http://localhost:${PORT}`);

    // Probar conexión con la base de datos
    await testConnection();
});
