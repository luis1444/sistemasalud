// ============================================
// 📄 entidades/asociaciones.js — Relaciones Sequelize
// ============================================
const Usuario = require('./Usuarios');
const Agenda = require('./Agenda');

// ✅ Definir asociaciones SOLO AQUÍ
Usuario.hasOne(Agenda, { foreignKey: 'id_medico', as: 'agenda' });
Agenda.belongsTo(Usuario, { foreignKey: 'id_medico', as: 'medico' });

module.exports = { Usuario, Agenda };
