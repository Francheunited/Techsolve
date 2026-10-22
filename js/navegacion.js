(() => {
    "use strict";

    const sesion = window.TechSolve?.obtenerSesion();

    const opcionPanelTecnico = document.querySelector("[data-panel-tecnico]");
    if (opcionPanelTecnico) {
        opcionPanelTecnico.hidden = !sesion || sesion.rol !== "tecnico";
    }

    // Oculta el enlace "Iniciar sesión" del menú y el botón de portada cuando ya hay sesión activa.
    const enlaceLoginNav = document.querySelector('nav a[href$="login.html"]');
    const itemLoginNav = enlaceLoginNav ? enlaceLoginNav.closest("li") : null;
    if (itemLoginNav) {
        itemLoginNav.hidden = Boolean(sesion);
    }

    const botonPortadaLogin = document.querySelector('.bienvenida a[href$="login.html"]');
    if (botonPortadaLogin) {
        botonPortadaLogin.hidden = Boolean(sesion);
    }

    // Muestra en el encabezado el usuario con sesión iniciada y opción para cerrar sesión.
    const nav = document.querySelector("header nav");
    if (nav) {
        let infoUsuario = document.getElementById("navUserSession");
        if (sesion) {
            if (!infoUsuario) {
                infoUsuario = document.createElement("div");
                infoUsuario.id = "navUserSession";
                infoUsuario.className = "user-session";

                const etiqueta = document.createElement("span");
                etiqueta.className = "user-session-name";
                etiqueta.textContent = `Usuario: ${sesion.usuario}`;

                const botonSalir = document.createElement("button");
                botonSalir.type = "button";
                botonSalir.className = "user-session-logout";
                botonSalir.textContent = "Cerrar sesión";
                botonSalir.addEventListener("click", () => window.TechSolve?.cerrarSesion());

                infoUsuario.append(etiqueta, botonSalir);
                nav.appendChild(infoUsuario);
            }
            infoUsuario.hidden = false;
        } else if (infoUsuario) {
            infoUsuario.hidden = true;
        }
    }

    // Si el usuario entra a login.html con la sesión ya iniciada, oculta el formulario de login.
    const loginForm = document.getElementById("loginForm");
    if (loginForm && sesion) {
        loginForm.hidden = true;
        const tarjeta = loginForm.closest(".form-card");
        const textoPrueba = tarjeta?.querySelector(".small-text");
        if (textoPrueba) textoPrueba.hidden = true;

        let avisoSesion = document.getElementById("activeSessionNotice");
        if (tarjeta && !avisoSesion) {
            avisoSesion = document.createElement("div");
            avisoSesion.id = "activeSessionNotice";
            avisoSesion.innerHTML = `<p>Sesión iniciada como <strong>${sesion.usuario}</strong>.</p>`;
            const btnCerrar = document.createElement("button");
            btnCerrar.type = "button";
            btnCerrar.className = "boton secondary";
            btnCerrar.textContent = "Cerrar sesión";
            btnCerrar.addEventListener("click", () => window.TechSolve?.cerrarSesion());
            avisoSesion.appendChild(btnCerrar);
            tarjeta.appendChild(avisoSesion);
        }
    }
})();
