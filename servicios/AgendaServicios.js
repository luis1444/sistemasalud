const agendaRepositorio = require('../Repositorios/AgendaRepositorio');
const citaRepositorio = require('../Repositorios/CitaRepositorio'); // Necesitarás este

class AgendaServicio {

    async obtenerAgendaPorMedico(idMedico) {
        return await agendaRepositorio.buscarPorIdMedico(idMedico);
    }

    async guardarAgenda(idMedico, datosAgenda) {
        // Validaciones básicas
        if (!idMedico) throw new Error('ID de médico es obligatorio.');

        if (!datosAgenda.dias_disponibles || !Array.isArray(datosAgenda.dias_disponibles) || datosAgenda.dias_disponibles.length === 0) {
            throw new Error('Los días disponibles son obligatorios y deben ser un array con al menos un día.');
        }

        if (datosAgenda.duracion_cita_minutos < 15 || datosAgenda.duracion_cita_minutos > 120) {
            throw new Error('La duración de la cita debe estar entre 15 y 120 minutos.');
        }

        // Validar que al menos un horario esté configurado
        const tieneHorarioManana = datosAgenda.hora_inicio_manana && datosAgenda.hora_fin_manana;
        const tieneHorarioTarde = datosAgenda.hora_inicio_tarde && datosAgenda.hora_fin_tarde;

        if (!tieneHorarioManana && !tieneHorarioTarde) {
            throw new Error('Debe configurar al menos un horario (mañana o tarde).');
        }

        return await agendaRepositorio.crearOActualizar(idMedico, datosAgenda);
    }

    async generarCitasAutomaticas(idMedico, agenda) {
        try {
            // Eliminar citas futuras existentes para este médico
            await citaRepositorio.eliminarCitasFuturasDisponibles(idMedico);

            const citasGeneradas = [];
            const fechaInicio = new Date();
            const fechaFin = new Date();
            fechaFin.setMonth(fechaFin.getMonth() + 3); // Generar citas para los próximos 3 meses

            const diasSemana = {
                'Domingo': 0,
                'Lunes': 1,
                'Martes': 2,
                'Miércoles': 3,
                'Jueves': 4,
                'Viernes': 5,
                'Sábado': 6
            };

            // Convertir días disponibles a números
            const diasDisponiblesNumeros = agenda.dias_disponibles.map(dia => diasSemana[dia]);

            // Iterar por cada día del período
            for (let fecha = new Date(fechaInicio); fecha <= fechaFin; fecha.setDate(fecha.getDate() + 1)) {
                const diaSemana = fecha.getDay();

                // Verificar si este día está disponible
                if (diasDisponiblesNumeros.includes(diaSemana)) {
                    const fechaStr = fecha.toISOString().split('T')[0];

                    // Generar citas de la mañana
                    if (agenda.hora_inicio_manana && agenda.hora_fin_manana) {
                        const citasManana = this.generarBloquesHorarios(
                            fechaStr,
                            agenda.hora_inicio_manana,
                            agenda.hora_fin_manana,
                            agenda.duracion_cita_minutos,
                            idMedico
                        );
                        citasGeneradas.push(...citasManana);
                    }

                    // Generar citas de la tarde
                    if (agenda.hora_inicio_tarde && agenda.hora_fin_tarde) {
                        const citasTarde = this.generarBloquesHorarios(
                            fechaStr,
                            agenda.hora_inicio_tarde,
                            agenda.hora_fin_tarde,
                            agenda.duracion_cita_minutos,
                            idMedico
                        );
                        citasGeneradas.push(...citasTarde);
                    }
                }
            }

            // Guardar todas las citas en la base de datos
            if (citasGeneradas.length > 0) {
                await citaRepositorio.crearMultiples(citasGeneradas);
            }

            console.log(`✅ Se generaron ${citasGeneradas.length} citas para el médico ${idMedico}`);
            return citasGeneradas;

        } catch (error) {
            console.error('❌ Error al generar citas automáticas:', error);
            throw new Error('Error al generar las citas automáticas.');
        }
    }

    generarBloquesHorarios(fecha, horaInicio, horaFin, duracionMinutos, idMedico) {
        const bloques = [];

        // Convertir horas a minutos
        const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
        const [horaFinH, horaFinM] = horaFin.split(':').map(Number);

        let minutosActuales = horaInicioH * 60 + horaInicioM;
        const minutosFin = horaFinH * 60 + horaFinM;

        while (minutosActuales + duracionMinutos <= minutosFin) {
            const horas = Math.floor(minutosActuales / 60);
            const minutos = minutosActuales % 60;
            const horaInicioBloque = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;

            minutosActuales += duracionMinutos;

            const horasFin = Math.floor(minutosActuales / 60);
            const minutosFin = minutosActuales % 60;
            const horaFinBloque = `${String(horasFin).padStart(2, '0')}:${String(minutosFin).padStart(2, '0')}`;

            bloques.push({
                id_medico: idMedico,
                fecha: fecha,
                hora_inicio: horaInicioBloque,
                hora_fin: horaFinBloque,
                estado: 'disponible',
                id_paciente: null,
                motivo_consulta: null,
                notas: null
            });
        }

        return bloques;
    }

    async autoOrganizarAgendas() {
        const medicosSinAgenda = await agendaRepositorio.obtenerAgendasDeMedicosSinAgenda();
        const promesas = medicosSinAgenda.map(async (medico) => {
            const agendaPorDefecto = {
                dias_disponibles: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
                hora_inicio_manana: '08:00',
                hora_fin_manana: '12:00',
                hora_inicio_tarde: '14:00',
                hora_fin_tarde: '18:00',
                duracion_cita_minutos: 30
            };
            const agendaCreada = await agendaRepositorio.crearOActualizar(medico.id, agendaPorDefecto);
            await this.generarCitasAutomaticas(medico.id, agendaCreada);
            return medico;
        });

        await Promise.all(promesas);

        return {
            totalOrganizados: medicosSinAgenda.length,
            medicos: medicosSinAgenda.map(m => m.nombre)
        };
    }

    async obtenerTodasLasAgendas() {
        return await agendaRepositorio.buscarTodas();
    }
}

module.exports = new AgendaServicio();