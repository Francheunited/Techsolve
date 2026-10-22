/* Sesión y almacenamiento compartidos por todas las páginas de TechSolve. */
window.TechSolve = (() => {
    "use strict";

    const CLAVE_TICKETS = "techsolveTickets";
    const CLAVE_LEGADO = "tickets";
    const CLAVE_MIGRACION = "techsolveTicketsMigrados";

    function obtenerSesion() {
        const usuario = localStorage.getItem("techsolveUser");
        const roles = {
            admin: "tecnico",
            empleado: "empleado",
            Constanza: "empleado",
            Walter: "empleado",
            Lautaro: "empleado",
            Alejandro: "empleado",
            Valeria: "empleado"
        };
        const rol = Object.hasOwn(roles, usuario) ? roles[usuario] : null;
        if (!rol) return null;

        // Completa también las sesiones creadas por la versión anterior.
        localStorage.setItem("techsolveRol", rol);
        return { usuario, rol };
    }

    function requerirSesion(rol) {
        const sesion = obtenerSesion();
        if (!sesion) {
            window.location.replace("login.html");
            return null;
        }
        // El admin (rol técnico) puede acceder y ver todas las páginas del sistema.
        if (rol && sesion.rol !== rol && sesion.rol !== "tecnico" && sesion.usuario !== "admin") {
            window.location.replace("mis-tickets.html");
            return null;
        }
        return sesion;
    }

    function cerrarSesion() {
        localStorage.removeItem("techsolveUser");
        localStorage.removeItem("techsolveRol");
        const enlaceLogin = document.querySelector('nav a[href$="login.html"]');
        window.location.href = enlaceLogin ? enlaceLogin.getAttribute("href") : "login.html";
    }

    function validarTickets(tickets) {
        if (!Array.isArray(tickets) || tickets.some(ticket =>
            !ticket || typeof ticket !== "object" || Array.isArray(ticket))) {
            throw new Error("El formato de los tickets guardados no es válido.");
        }
        return tickets;
    }

    function siguienteId(tickets) {
        const numeros = tickets.map(ticket => /^TS(\d+)$/.exec(String(ticket.id)));
        const mayor = Math.max(0, ...numeros.filter(Boolean).map(match => Number(match[1])));
        return "TS" + String(mayor + 1).padStart(2, "0");
    }

    function normalizarTickets(tickets) {
        const resultado = [];
        const reservados = tickets.map(ticket => ({ id: String(ticket.id || "") }));
        tickets.forEach(ticket => {
            const idOriginal = String(ticket.id || "");
            const id = idOriginal && !resultado.some(item => item.id === idOriginal)
                ? idOriginal
                : siguienteId(reservados.concat(resultado));
            resultado.push({
                ...ticket,
                id,
                // La versión base tenía una única cuenta de empleado y no guardaba dueño.
                usuario: ticket.usuario || "empleado",
                categoria: ticket.categoria || "Otros",
                descripcion: ticket.descripcion || "",
                estado: ticket.estado || "Pendiente",
                prioridad: ticket.prioridad || "Media"
            });
        });
        return resultado;
    }

    function guardarTickets(tickets) {
        localStorage.setItem(CLAVE_TICKETS, JSON.stringify(validarTickets(tickets)));
    }

    async function cargarDatosIniciales() {
        if (window.location.protocol === "file:") {
            return validarTickets(window.TechSolveDatosIniciales);
        }
        const respuesta = await fetch(new URL("../data/datos.json", window.location.href));
        if (!respuesta.ok) throw new Error("No se pudieron cargar los tickets iniciales.");
        return validarTickets(await respuesta.json());
    }

    async function obtenerTickets() {
        const guardados = localStorage.getItem(CLAVE_TICKETS);
        let tickets = normalizarTickets(guardados === null
            ? await cargarDatosIniciales()
            : validarTickets(JSON.parse(guardados)));

        // Importa una sola vez los tickets de la base, conservando su copia original.
        const legado = localStorage.getItem(CLAVE_LEGADO);
        const importarLegado = legado !== null && localStorage.getItem(CLAVE_MIGRACION) === null;
        if (importarLegado) {
            const anteriores = validarTickets(JSON.parse(legado));
            const pendientes = anteriores.map((ticket, indice) => ({
                ...ticket,
                origenLegado: "tickets:" + indice
            })).filter(ticket => !tickets.some(item => item.origenLegado === ticket.origenLegado));
            tickets = normalizarTickets(tickets.concat(pendientes));
        }

        guardarTickets(tickets);
        // La identidad queda junto al ticket: un reintento no duplica la importación.
        if (importarLegado) localStorage.setItem(CLAVE_MIGRACION, "1");
        return tickets;
    }

    function puedeEditar(ticket) {
        const sesion = obtenerSesion();
        return Boolean(sesion && (
            sesion.rol === "tecnico" ||
            sesion.usuario === "admin" ||
            (sesion.rol === "empleado" && ticket.usuario === sesion.usuario)
        ));
    }

    return {
        obtenerSesion,
        requerirSesion,
        cerrarSesion,
        siguienteId,
        obtenerTickets,
        guardarTickets,
        puedeEditar
    };
})();
