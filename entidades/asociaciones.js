// ============================================
// 📄 entidades/asociaciones.js — Relaciones Sequelize
// ============================================
const Usuario = require('./Usuarios');
const Agenda = require('./Agenda');
const Cita = require('./Cita');

// ✅ Asociaciones de Agenda
Usuario.hasOne(Agenda, { foreignKey: 'id_medico', as: 'agenda' });
Agenda.belongsTo(Usuario, { foreignKey: 'id_medico', as: 'medico' });

// ✅ Asociaciones de Cita - Relación con Médico
Usuario.hasMany(Cita, { foreignKey: 'id_medico', as: 'citasComoMedico' });
Cita.belongsTo(Usuario, { foreignKey: 'id_medico', as: 'medico' });

// ✅ Asociaciones de Cita - Relación con Paciente
Usuario.hasMany(Cita, { foreignKey: 'id_paciente', as: 'citasComoPaciente' });
Cita.belongsTo(Usuario, { foreignKey: 'id_paciente', as: 'paciente' });

module.exports = { Usuario, Agenda, Cita };