document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formRegistro");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const datos = Object.fromEntries(new FormData(e.target).entries());

        try {
            const respuesta = await fetch("/api/usuarios/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });

            const resultado = await respuesta.json();

            if (resultado.exito) {
                Swal.fire({
                    icon: "success",
                    title: "¡Registro exitoso!",
                    text: "Tu cuenta ha sido creada correctamente. Redirigiendo al inicio de sesión...",
                    showConfirmButton: false,
                    timer: 2500,
                });

                // Redirigir al inicio de sesión después de 2.5 segundos
                setTimeout(() => {
                    window.location.href = "/login.html";
                }, 2500);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error en el registro",
                    text: resultado.mensaje || "No se pudo completar el registro. Intenta nuevamente.",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error del servidor",
                text: "Hubo un problema al conectar con el servidor.",
            });
            console.error("Error:", error);
        }
    });
});
