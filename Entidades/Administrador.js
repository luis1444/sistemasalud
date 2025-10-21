class Administrador {
    constructor(datos) {
        this.id = datos.id || this.generarId();
        this.nombre = datos.nombre;
        this.apellido = datos.apellido;
        this.email = datos.email;
        this.telefono = datos.telefono;
        this.fechaCreacion = datos.fechaCreacion || new Date();
        this.ultimoAcceso = datos.ultimoAcceso || null;
        this.activo = datos.activo !== undefined ? datos.activo : true;

        // Permisos del administrador
        this.permisos = datos.permisos || {
            gestionarMedicos: true,
            gestionarLaboratorios: true,
            gestionarFarmacias: true,
            gestionarUsuarios: true,
            verReportes: true
        };
    }

    generarId() {
        return 'ADM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Métodos para gestionar Médicos
    registrarMedico(datosMedico) {
        if (!this.permisos.gestionarMedicos) {
            throw new Error('No tiene permisos para gestionar médicos');
        }

        return {
            id: this.generarIdEntidad('MED'),
            ...datosMedico,
            rol: 'medico',
            estado: 'activo',
            fechaRegistro: new Date(),
            registradoPor: this.id,
            especialidades: datosMedico.especialidades || [],
            licenciaMedica: datosMedico.licenciaMedica,
            consultorio: datosMedico.consultorio || null,
            horarioAtencion: datosMedico.horarioAtencion || {}
        };
    }

    actualizarMedico(idMedico, datosActualizados) {
        if (!this.permisos.gestionarMedicos) {
            throw new Error('No tiene permisos para gestionar médicos');
        }

        return {
            idMedico,
            datosActualizados,
            fechaActualizacion: new Date(),
            actualizadoPor: this.id
        };
    }

    suspenderMedico(idMedico, motivo) {
        if (!this.permisos.gestionarMedicos) {
            throw new Error('No tiene permisos para gestionar médicos');
        }

        return {
            idMedico,
            accion: 'suspendido',
            motivo,
            fecha: new Date(),
            administrador: this.id
        };
    }

    activarMedico(idMedico) {
        if (!this.permisos.gestionarMedicos) {
            throw new Error('No tiene permisos para gestionar médicos');
        }

        return {
            idMedico,
            accion: 'activado',
            fecha: new Date(),
            administrador: this.id
        };
    }

    // Métodos para gestionar Laboratorios
    registrarLaboratorio(datosLaboratorio) {
        if (!this.permisos.gestionarLaboratorios) {
            throw new Error('No tiene permisos para gestionar laboratorios');
        }

        return {
            id: this.generarIdEntidad('LAB'),
            ...datosLaboratorio,
            rol: 'laboratorio',
            estado: 'activo',
            fechaRegistro: new Date(),
            registradoPor: this.id,
            nombreLaboratorio: datosLaboratorio.nombreLaboratorio,
            direccion: datosLaboratorio.direccion,
            telefono: datosLaboratorio.telefono,
            email: datosLaboratorio.email,
            tiposExamen: datosLaboratorio.tiposExamen || [],
            horarioAtencion: datosLaboratorio.horarioAtencion || {},
            certificaciones: datosLaboratorio.certificaciones || []
        };
    }

    actualizarLaboratorio(idLaboratorio, datosActualizados) {
        if (!this.permisos.gestionarLaboratorios) {
            throw new Error('No tiene permisos para gestionar laboratorios');
        }

        return {
            idLaboratorio,
            datosActualizados,
            fechaActualizacion: new Date(),
            actualizadoPor: this.id
        };
    }

    suspenderLaboratorio(idLaboratorio, motivo) {
        if (!this.permisos.gestionarLaboratorios) {
            throw new Error('No tiene permisos para gestionar laboratorios');
        }

        return {
            idLaboratorio,
            accion: 'suspendido',
            motivo,
            fecha: new Date(),
            administrador: this.id
        };
    }

    activarLaboratorio(idLaboratorio) {
        if (!this.permisos.gestionarLaboratorios) {
            throw new Error('No tiene permisos para gestionar laboratorios');
        }

        return {
            idLaboratorio,
            accion: 'activado',
            fecha: new Date(),
            administrador: this.id
        };
    }

    // Métodos para gestionar Farmacias
    registrarFarmacia(datosFarmacia) {
        if (!this.permisos.gestionarFarmacias) {
            throw new Error('No tiene permisos para gestionar farmacias');
        }

        return {
            id: this.generarIdEntidad('FAR'),
            ...datosFarmacia,
            rol: 'farmacia',
            estado: 'activo',
            fechaRegistro: new Date(),
            registradoPor: this.id,
            nombreFarmacia: datosFarmacia.nombreFarmacia,
            direccion: datosFarmacia.direccion,
            telefono: datosFarmacia.telefono,
            email: datosFarmacia.email,
            horarioAtencion: datosFarmacia.horarioAtencion || {},
            servicios: datosFarmacia.servicios || ['venta', 'despacho'],
            licenciaFarmaceutica: datosFarmacia.licenciaFarmaceutica
        };
    }

    actualizarFarmacia(idFarmacia, datosActualizados) {
        if (!this.permisos.gestionarFarmacias) {
            throw new Error('No tiene permisos para gestionar farmacias');
        }

        return {
            idFarmacia,
            datosActualizados,
            fechaActualizacion: new Date(),
            actualizadoPor: this.id
        };
    }

    suspenderFarmacia(idFarmacia, motivo) {
        if (!this.permisos.gestionarFarmacias) {
            throw new Error('No tiene permisos para gestionar farmacias');
        }

        return {
            idFarmacia,
            accion: 'suspendido',
            motivo,
            fecha: new Date(),
            administrador: this.id
        };
    }

    activarFarmacia(idFarmacia) {
        if (!this.permisos.gestionarFarmacias) {
            throw new Error('No tiene permisos para gestionar farmacias');
        }

        return {
            idFarmacia,
            accion: 'activado',
            fecha: new Date(),
            administrador: this.id
        };
    }

    // Métodos auxiliares
    generarIdEntidad(prefijo) {
        return prefijo + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    verificarPermiso(tipoPermiso) {
        return this.permisos[tipoPermiso] === true;
    }

    actualizarUltimoAcceso() {
        this.ultimoAcceso = new Date();
    }

    // Método para obtener información del administrador
    obtenerInfo() {
        return {
            id: this.id,
            nombre: this.nombre,
            apellido: this.apellido,
            email: this.email,
            telefono: this.telefono,
            activo: this.activo,
            permisos: this.permisos,
            fechaCreacion: this.fechaCreacion,
            ultimoAcceso: this.ultimoAcceso
        };
    }

    // Método para generar reportes
    generarReporte(tipoReporte, parametros) {
        if (!this.permisos.verReportes) {
            throw new Error('No tiene permisos para generar reportes');
        }

        return {
            tipo: tipoReporte,
            parametros,
            fechaGeneracion: new Date(),
            generadoPor: this.id
        };
    }
}

module.exports = Administrador;