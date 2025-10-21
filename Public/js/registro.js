document.getElementById('formRegistro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = Object.fromEntries(new FormData(e.target).entries());

    try {
        const res = await fetch('/api/usuarios/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const data = await res.json();
        if (!data.exito) throw new Error(data.mensaje);

        alert('Registro exitoso');

        // Redirección según rol
        const rol = data.datos.usuario.rol;
        if (rol === 'paciente') {
            window.location.href = '/dashboard_paciente.html';
        } else if (rol === 'admin') {
            window.location.href = '/dashboard_admin.html';
        }

    } catch (err) {
        alert(`Error: ${err.message}`);
    }
});
