(() => {
    "use strict";

    if (!TechSolve.requerirSesion("empleado")) return;
    const formulario = document.getElementById("formularioTicket");
    const boton = formulario.querySelector('button[type="submit"]');
    const descripcion = document.getElementById("descripcion");

    descripcion.addEventListener("input", () => descripcion.setCustomValidity(""));

    formulario.addEventListener("submit", async event => {
        event.preventDefault();
        const sesion = TechSolve.requerirSesion("empleado");
        if (!sesion) return;

        const categoria = document.getElementById("categoria");
        descripcion.setCustomValidity(descripcion.value.trim() ? "" : "Describí el problema.");
        if (!formulario.reportValidity()) return;

        boton.disabled = true;
        try {
            const tickets = await TechSolve.obtenerTickets();
            tickets.push({
                id: TechSolve.siguienteId(tickets),
                usuario: sesion.usuario,
                categoria: categoria.options[categoria.selectedIndex].text,
                descripcion: descripcion.value.trim(),
                estado: "Pendiente",
                prioridad: "Media"
            });
            TechSolve.guardarTickets(tickets);
            alert("Ticket registrado correctamente");
            formulario.reset();
        } catch (error) {
            alert("No se pudo guardar el ticket. " + error.message);
        } finally {
            boton.disabled = false;
        }
    });
})();
