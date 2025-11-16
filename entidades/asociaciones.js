// ============================================
//  entidades/asociaciones.js — Relaciones Sequelize
// ============================================
const Usuario = require('./Usuarios');
const Agenda = require('./Agenda');
const Cita = require('./Cita');
const Autorizacion = require('./Autorizacion');
const ExamenLaboratorio = require('./ExamenLaboratorio');

// ============================================
// ASOCIACIONES DE AGENDA
// ============================================
Usuario.hasOne(Agenda, { foreignKey: 'id_medico', as: 'agenda' });
Agenda.belongsTo(Usuario, { foreignKey: 'id_medico', as: 'medico' });

// ============================================
// ASOCIACIONES DE CITA
// ============================================

// Cita - Relación con Médico
Usuario.hasMany(Cita, { foreignKey: 'id_medico', as: 'citasComoMedico' });
Cita.belongsTo(Usuario, { foreignKey: 'id_medico', as: 'medico' });

// Cita - Relación con Paciente
Usuario.hasMany(Cita, { foreignKey: 'id_paciente', as: 'citasComoPaciente' });
Cita.belongsTo(Usuario, { foreignKey: 'id_paciente', as: 'paciente' });

// ============================================
// ASOCIACIONES DE AUTORIZACIONES
// ============================================

// Autorización pertenece a un médico (quien solicita)
Autorizacion.belongsTo(Usuario, {
    foreignKey: 'id_medico',
    as: 'medico'
});

// Autorización pertenece a un paciente
Autorizacion.belongsTo(Usuario, {
    foreignKey: 'id_paciente',
    as: 'paciente'
});

// Autorización pertenece a una cita
Autorizacion.belongsTo(Cita, {
    foreignKey: 'id_cita',
    as: 'cita'
});

// Autorización tiene un aprobador (administrador)
Autorizacion.belongsTo(Usuario, {
    foreignKey: 'id_aprobador',
    as: 'aprobador'
});

// Relaciones inversas de Autorizaciones
Usuario.hasMany(Autorizacion, {
    foreignKey: 'id_medico',
    as: 'autorizacionesSolicitadas'
});

Usuario.hasMany(Autorizacion, {
    foreignKey: 'id_paciente',
    as: 'autorizacionesPaciente'
});

Usuario.hasMany(Autorizacion, {
    foreignKey: 'id_aprobador',
    as: 'autorizacionesAprobadas'
});

Cita.hasMany(Autorizacion, {
    foreignKey: 'id_cita',
    as: 'autorizaciones'
});

// ============================================
// ASOCIACIONES DE EXÁMENES DE LABORATORIO
// ============================================

// ExamenLaboratorio pertenece a una Autorización
ExamenLaboratorio.belongsTo(Autorizacion, {
    foreignKey: 'id_autorizacion',
    as: 'autorizacion'
});

// Autorización tiene un ExamenLaboratorio (relación inversa)
Autorizacion.hasOne(ExamenLaboratorio, {
    foreignKey: 'id_autorizacion',
    as: 'examenLaboratorio'
});

// ExamenLaboratorio pertenece a un Usuario (técnico de laboratorio)
ExamenLaboratorio.belongsTo(Usuario, {
    foreignKey: 'id_tecnico',
    as: 'tecnico'
});

// Usuario tiene muchos ExamenesLaboratorio (como técnico)
Usuario.hasMany(ExamenLaboratorio, {
    foreignKey: 'id_tecnico',
    as: 'examenesRealizados'
});

// ============================================
// EXPORTAR MODELOS
// ============================================
module.exports = {
    Usuario,
    Agenda,
    Cita,
    Autorizacion,
    ExamenLaboratorio
};