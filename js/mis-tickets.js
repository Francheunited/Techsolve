(() => {
    "use strict";

    const sesion = TechSolve.requerirSesion();
    if (!sesion) return;
    document.getElementById("welcomeText").textContent =
        `Hola ${sesion.usuario}, aquí verás tus tickets activos.`;
    document.getElementById("logoutButton").addEventListener("click", TechSolve.cerrarSesion);

    const tabla = document.getElementById("ticketsTableBody");
    const panel = document.getElementById("historialPanel");
    const selector = document.getElementById("selectorTicket");
    const formulario = document.getElementById("editarTicketForm");
    const categoria = document.getElementById("editarCategoria");
    const descripcion = document.getElementById("editarDescripcion");
    const mensaje = document.getElementById("mensajeEdicion");
    const botonHistorial = document.getElementById("historialTicketsButton");
    const botonGuardar = formulario.querySelector('button[type="submit"]');
    let tickets = [];

    function mostrarTickets() {
        tabla.replaceChildren();
        selector.replaceChildren();

        tickets.forEach(ticket => {
            const fila = tabla.insertRow();
            [ticket.id, ticket.categoria, ticket.descripcion, ticket.estado, ticket.prioridad]
                .forEach(valor => { fila.insertCell().textContent = valor; });

            if (TechSolve.puedeEditar(ticket)) {
                selector.add(new Option(ticket.id + " - " + ticket.descripcion, ticket.id));
            }
        });

        if (!tickets.length) {
            const celda = tabla.insertRow().insertCell();
            celda.colSpan = 5;
            celda.textContent = "No hay tickets registrados.";
        }
        formulario.hidden = selector.options.length === 0;
        selector.disabled = formulario.hidden;
        mensaje.textContent = formulario.hidden ? "No tenés tickets disponibles para editar." : "";
    }

    function completarFormulario() {
        const ticket = tickets.find(item => item.id === selector.value);
        if (!ticket || !TechSolve.puedeEditar(ticket)) return;
        categoria.value = ticket.categoria;
        descripcion.value = ticket.descripcion;
        mensaje.textContent = "";
    }

    botonHistorial.addEventListener("click", () => {
        panel.hidden = !panel.hidden;
        botonHistorial.setAttribute("aria-expanded", String(!panel.hidden));
    });
    selector.addEventListener("change", completarFormulario);

    formulario.addEventListener("submit", async event => {
        event.preventDefault();
        const id = selector.value;
        const nuevaCategoria = categoria.value.trim();
        const nuevaDescripcion = descripcion.value.trim();
        if (!nuevaCategoria || !nuevaDescripcion) {
            mensaje.textContent = "Completá categoría y descripción.";
            return;
        }

        botonGuardar.disabled = true;
        try {
            // Vuelve a leer los datos para conservar tickets creados desde otras páginas.
            tickets = await TechSolve.obtenerTickets();
            const ticket = tickets.find(item => item.id === id);
            if (!ticket || !TechSolve.puedeEditar(ticket)) {
                mensaje.textContent = "No podés editar este ticket.";
                return;
            }

            ticket.categoria = nuevaCategoria;
            ticket.descripcion = nuevaDescripcion;
            TechSolve.guardarTickets(tickets);
            mostrarTickets();
            selector.value = id;
            completarFormulario();
            mensaje.textContent = "Cambios guardados correctamente.";
        } catch (error) {
            mensaje.textContent = "No se pudieron guardar los cambios. " + error.message;
        } finally {
            botonGuardar.disabled = false;
        }
    });

    TechSolve.obtenerTickets().then(resultado => {
        tickets = resultado;
        mostrarTickets();
        completarFormulario();
    }).catch(error => {
        tabla.replaceChildren();
        const celda = tabla.insertRow().insertCell();
        celda.colSpan = 5;
        celda.textContent = "No se pudieron cargar los tickets.";
        formulario.hidden = true;
        selector.disabled = true;
        mensaje.textContent = error.message;
    });
})();
