// ============================================
// 📄 entidades/asociaciones.js — Relaciones Sequelize
// ============================================
const Usuario = require('./Usuarios');
const Agenda = require('./Agenda');
const Cita = require('./Cita');
const Autorizacion = require('../entidades/Autorizacion');

// ✅ Asociaciones de Agenda
Usuario.hasOne(Agenda, { foreignKey: 'id_medico', as: 'agenda' });
Agenda.belongsTo(Usuario, { foreignKey: 'id_medico', as: 'medico' });

// ✅ Asociaciones de Cita - Relación con Médico
Usuario.hasMany(Cita, { foreignKey: 'id_medico', as: 'citasComoMedico' });
Cita.belongsTo(Usuario, { foreignKey: 'id_medico', as: 'medico' });

// ✅ Asociaciones de Cita - Relación con Paciente
Usuario.hasMany(Cita, { foreignKey: 'id_paciente', as: 'citasComoPaciente' });
Cita.belongsTo(Usuario, { foreignKey: 'id_paciente', as: 'paciente' });

// ============================================
// RELACIONES DE AUTORIZACIONES
// ============================================

// Una autorización pertenece a un médico
Autorizacion.belongsTo(Usuario, {
    foreignKey: 'id_medico',
    as: 'medico'
});

// Una autorización pertenece a un paciente
Autorizacion.belongsTo(Usuario, {
    foreignKey: 'id_paciente',
    as: 'paciente'
});

// Una autorización pertenece a una cita
Autorizacion.belongsTo(Cita, {
    foreignKey: 'id_cita',
    as: 'cita'
});

// Una autorización puede tener un aprobador (administrador)
Autorizacion.belongsTo(Usuario, {
    foreignKey: 'id_aprobador',
    as: 'aprobador'
});

// Relaciones inversas
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


module.exports = { Usuario, Agenda, Cita, Autorizacion };