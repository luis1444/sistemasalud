require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { sequelize, testConnection } = require('./Config/database');
require('./entidades/asociaciones'); // ✅ Importa relaciones

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
// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Servir específicamente los archivos JS
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// Servir imágenes
app.use('/Fotos', express.static(path.join(__dirname, 'public', 'Fotos')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// ============================================
// 🧩 Rutas de API
// ============================================
// ⚠️ IMPORTANTE: Las rutas más específicas deben ir PRIMERO
// para evitar que /api/usuarios/:id capture /api/usuarios/perfil

// 1️⃣ Rutas de Agenda
const agendaRutas = require('./rutas/agendaRutas');
app.use('/api/agendas', agendaRutas);

// 2️⃣ Rutas de Citas
const citaRutas = require('./rutas/citaRutas');
app.use('/api/citas', citaRutas);

// 3️⃣ Rutas de Usuarios
const usuarioRutas = require('./rutas/UsuarioRutas');
app.use('/api/usuarios', usuarioRutas);

const autorizacionRutas = require('./rutas/autorizacionRutas');
app.use('/api/autorizaciones', autorizacionRutas);
// ============================================
// 🏠 Rutas del Frontend
// ============================================

// Página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Vistas', 'index.html'));
});

// Página de inicio de sesión
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Vistas', 'login.html'));
});

// Página de registro
app.get('/registro.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Vistas', 'registro.html'));
});

// Dashboards
app.get('/Vistas/dashboard-paciente.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Vistas', 'dashboard-paciente.html'));
});

app.get('/Vistas/dashboard-admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Vistas', 'dashboard-admin.html'));
});

app.get('/dashboard-paciente.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Vistas', 'dashboard-paciente.html'));
});

app.get('/dashboard-admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Vistas', 'dashboard-admin.html'));
});

// Gestión de personal (Administrador)
app.get('/Vistas/gestion-personal.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Vistas', 'gestion-personal.html'));
});

// ============================================
// 🚀 Iniciar servidor y sincronizar base de datos
// ============================================
app.listen(PORT, async () => {
    console.log(`✅ Servidor VITAL+ corriendo en: http://localhost:${PORT}`);
    console.log(`📁 Sirviendo archivos estáticos desde: ${path.join(__dirname, 'public')}`);

    // 1️⃣ Verificar conexión
    await testConnection();

    try {
        console.log('🔄 Sincronizando base de datos...');
        // 2️⃣ Cargar modelos
        require('./entidades/Usuarios');
        require('./entidades/Agenda');

        // 3️⃣ Crear o actualizar tablas automáticamente
        await sequelize.sync({ alter: true });
        console.log('✅ Tablas sincronizadas correctamente.');
    } catch (error) {
        console.error('❌ Error al sincronizar la base de datos:', error);
    }
});

// Manejar errores 404 (filtrar errores de Chrome DevTools)
app.use((req, res) => {
    // Ignorar peticiones de Chrome DevTools
    if (req.url.includes('.well-known/appspecific')) {
        return res.status(404).end();
    }

    console.log(`❌ Archivo no encontrado: ${req.url}`);
    console.log(`   Ruta completa intentada: ${path.join(__dirname, 'public', req.url)}`);
    res.status(404).json({
        error: 'Recurso no encontrado',
        ruta: req.url
    });
});