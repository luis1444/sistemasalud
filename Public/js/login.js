// public/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formLogin');

    if (!formLogin) {
        console.error('Formulario de login no encontrado');
        return;
    }

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener valores del formulario
        const correo = document.getElementById('correo').value.trim();
        const contrasena = document.getElementById('contrasena').value;
        const recordar = document.getElementById('recordar').checked;

        // Validaciones básicas
        if (!correo || !contrasena) {
            Swal.fire({
                icon: 'error',
                title: 'Campos incompletos',
                text: 'Por favor completa todos los campos',
                confirmButtonColor: '#0077b6'
            });
            return;
        }

        // Mostrar loading
        Swal.fire({
            title: 'Iniciando sesión...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Realizar petición al backend
            const response = await fetch('http://localhost:3000/api/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ correo, contrasena })
            });

            const data = await response.json();

            if (data.exito) {
                // Guardar token y datos del usuario
                localStorage.setItem('token', data.datos.token);
                localStorage.setItem('usuario', JSON.stringify(data.datos.usuario));

                if (recordar) {
                    localStorage.setItem('recordarSesion', 'true');
                }

                // Mostrar mensaje de éxito
                await Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido!',
                    text: data.mensaje,
                    timer: 1500,
                    showConfirmButton: false
                });

                // Redirigir según el rol
                const rol = data.datos.usuario.rol;

                console.log('Redirigiendo usuario con rol:', rol);

                switch (rol) {
                    case 'paciente':
                        window.location.href = '/Vistas/dashboard-paciente.html';
                        break;
                    case 'admin':
                        window.location.href = '/Vistas/dashboard-admin.html';
                        break;
                    case 'doctor':
                        window.location.href = '/Vistas/dashboard-doctor.html';
                        break;
                    case 'laboratorio':
                        window.location.href = '/Vistas/dashboard-laboratorio.html';
                        break;
                    case 'farmacia':
                        window.location.href = '/Vistas/dashboard-farmacia.html';
                        break;
                    default:
                        window.location.href = '/Vistas/dashboard.html';
                }

            } else {
                // Mostrar error del servidor
                Swal.fire({
                    icon: 'error',
                    title: 'Error al iniciar sesión',
                    text: data.mensaje || 'Credenciales incorrectas',
                    confirmButtonColor: '#0077b6'
                });
            }

        } catch (error) {
            console.error('Error en login:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor. Por favor intenta de nuevo.',
                confirmButtonColor: '#0077b6'
            });
        }
    });

    // Verificar si hay sesión activa
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');

    if (token && usuario) {
        const userData = JSON.parse(usuario);
        const rol = userData.rol;

        // Redirigir al dashboard correspondiente
        switch (rol) {
            case 'paciente':
                window.location.href = '/dashboard-paciente.html';
                break;
            case 'admin':
                window.location.href = '/dashboard-admin.html';
                break;
            default:
                break;
        }
    }
});