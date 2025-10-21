// Entidades/InicioSesion.js

class InicioSesion {
    constructor(data = {}) {
        this.usuario = data.usuario || '';
        this.contrasena = data.contrasena || '';
        this.tokenSesion = data.tokenSesion || null;
        this.fechaHoraAcceso = data.fechaHoraAcceso || new Date();
        this.direccionIP = data.direccionIP || '';
        this.dispositivo = data.dispositivo || '';
        this.resultado = data.resultado || null; // 'exito' | 'fallo'
        this.intentosFallidos = data.intentosFallidos || 0;
        this.bloqueado = data.bloqueado || false;
        this.tiempoBloqueo = data.tiempoBloqueo || null;
    }

    // Validaciones
    validarFormulario() {
        const errores = [];

        if (!this.usuario || this.usuario.trim() === '') {
            errores.push('El campo usuario es obligatorio');
        }

        if (!this.contrasena || this.contrasena.trim() === '') {
            errores.push('El campo contraseña es obligatorio');
        }

        if (this.contrasena && this.contrasena.length < 8) {
            errores.push('La contraseña debe tener al menos 8 caracteres');
        }

        return {
            valido: errores.length === 0,
            errores: errores
        };
    }

    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Métodos de negocio
    incrementarIntentosFallidos() {
        this.intentosFallidos++;

        if (this.intentosFallidos >= 3) {
            this.bloquearCuenta();
        }
    }

    bloquearCuenta() {
        this.bloqueado = true;
        this.tiempoBloqueo = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    }

    desbloquearCuenta() {
        if (this.tiempoBloqueo && new Date() >= this.tiempoBloqueo) {
            this.bloqueado = false;
            this.intentosFallidos = 0;
            this.tiempoBloqueo = null;
            return true;
        }
        return false;
    }

    estaBloqueada() {
        if (this.bloqueado && this.tiempoBloqueo) {
            if (new Date() >= this.tiempoBloqueo) {
                this.desbloquearCuenta();
                return false;
            }
            return true;
        }
        return false;
    }

    tiempoRestanteBloqueo() {
        if (this.estaBloqueada()) {
            const ahora = new Date();
            const diferencia = this.tiempoBloqueo - ahora;
            const minutos = Math.floor(diferencia / 60000);
            const segundos = Math.floor((diferencia % 60000) / 1000);
            return `${minutos}:${segundos.toString().padStart(2, '0')}`;
        }
        return null;
    }

    reiniciarIntentos() {
        this.intentosFallidos = 0;
    }

    // Métodos para auditoría
    obtenerDatosAuditoria() {
        return {
            usuario: this.usuario,
            fechaHora: this.fechaHoraAcceso,
            ip: this.direccionIP,
            dispositivo: this.dispositivo,
            resultado: this.resultado,
            intentosFallidos: this.intentosFallidos,
            bloqueado: this.bloqueado
        };
    }

    // Convertir a objeto plano para envío
    toJSON() {
        return {
            usuario: this.usuario,
            contrasena: this.contrasena,
            direccionIP: this.direccionIP,
            dispositivo: this.dispositivo
        };
    }

    // Crear desde respuesta del servidor
    static fromServerResponse(data) {
        return new InicioSesion({
            usuario: data.usuario,
            tokenSesion: data.token,
            fechaHoraAcceso: new Date(data.fechaAcceso),
            direccionIP: data.ip,
            dispositivo: data.dispositivo,
            resultado: data.resultado,
            intentosFallidos: data.intentosFallidos || 0,
            bloqueado: data.bloqueado || false,
            tiempoBloqueo: data.tiempoBloqueo ? new Date(data.tiempoBloqueo) : null
        });
    }
}

module.exports = InicioSesion;