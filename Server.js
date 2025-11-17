require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { sequelize, testConnection } = require('./Config/database');

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
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/Fotos', express.static(path.join(__dirname, 'public', 'Fotos')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// ============================================
// 🧩 Rutas de API
// ============================================
const agendaRutas = require('./rutas/agendaRutas');
app.use('/api/agendas', agendaRutas);

const citaRutas = require('./rutas/citaRutas');
app.use('/api/citas', citaRutas);

const usuarioRutas = require('./rutas/UsuarioRutas');
app.use('/api/usuarios', usuarioRutas);

const autorizacionRutas = require('./rutas/autorizacionRutas');
app.use('/api/autorizaciones', autorizacionRutas);

const laboratorioRutas = require('./rutas/laboratorioRutas');
app.use('/api/laboratorio', laboratorioRutas);

// ============================================
// 🏠 Rutas del Frontend
// ============================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Vistas', 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Vistas', 'login.html'));
});

app.get('/registro.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Vistas', 'registro.html'));
});

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

        // 2️⃣ Cargar TODOS los modelos (esto es crítico)
        console.log('📦 Cargando modelos...');
        require('./entidades/Usuarios');
        require('./entidades/Agenda');
        require('./entidades/Cita');
        require('./entidades/Autorizacion');
        require('./entidades/ExamenLaboratorio');
        console.log('✅ Modelos cargados');

        // 3️⃣ Cargar las asociaciones DESPUÉS de los modelos
        console.log('🔗 Configurando asociaciones...');
        require('./entidades/asociaciones');

        // 4️⃣ Sincronizar base de datos con logging activado
        console.log('⚙️ Sincronizando tablas...');
        await sequelize.sync({
            logging: console.log  // 👈 Esto muestra las queries SQL
        });

        console.log('✅ Tablas sincronizadas correctamente.');
        console.log('📋 Tablas en la base de datos:');
        console.log('   - usuarios');
        console.log('   - agendas');
        console.log('   - citas');
        console.log('   - autorizaciones ✨');
        console.log('   - examenes_laboratorio ✨');
    } catch (error) {
        console.error('❌ Error al sincronizar la base de datos:', error);
    }
});

// Manejar errores 404
app.use((req, res) => {
    if (req.url.includes('.well-known/appspecific')) {
        return res.status(404).end();
    }

    console.log(`❌ Archivo no encontrado: ${req.url}`);
    res.status(404).json({
        error: 'Recurso no encontrado',
        ruta: req.url
    });
});