(() => {
    "use strict";

    const credenciales = [
        { usuario: "admin", clave: "1234", rol: "tecnico" },
        { usuario: "empleado", clave: "ticket2026", rol: "empleado" },
        { usuario: "Constanza", clave: "1234", rol: "empleado" },
        { usuario: "Walter", clave: "1234", rol: "empleado" },
        { usuario: "Lautaro", clave: "1234", rol: "empleado" },
        { usuario: "Alejandro", clave: "1234", rol: "empleado" },
        { usuario: "Valeria", clave: "1234", rol: "empleado" }
    ];
    const formulario = document.getElementById("loginForm");
    const mensaje = document.getElementById("errorMessage");

    formulario.addEventListener("submit", event => {
        event.preventDefault();
        const usuario = document.getElementById("user").value.trim();
        const clave = document.getElementById("password").value;
        const coincidencia = credenciales.find(item => item.usuario === usuario && item.clave === clave);

        if (!coincidencia) {
            mensaje.textContent = "Usuario o contraseña incorrectos. Intenta de nuevo.";
            return;
        }

        try {
            localStorage.setItem("techsolveUser", coincidencia.usuario);
            localStorage.setItem("techsolveRol", coincidencia.rol);
            window.location.href = coincidencia.rol === "tecnico"
                ? "panel-tecnico.html"
                : "mis-tickets.html";
        } catch (error) {
            mensaje.textContent = "No se pudo guardar la sesión. Permití el almacenamiento del navegador.";
        }
    });
})();
