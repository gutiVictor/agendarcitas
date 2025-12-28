/**
 * CitaComuna - Sistema de Agendamiento de Citas
 * Comunas 1 y 2 - Armenia, Quindío
 */

// Elementos del DOM
const fechaInput = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const form = document.getElementById("formCita");
const mensaje = document.getElementById("mensaje");

// Configuración
const HORARIOS_BASE = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "14:00",
  "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
];

const STORAGE_KEY = "citacomuna_citas";

// =============================================
// Funciones de Almacenamiento Local
// =============================================

function obtenerCitas() {
  const citas = localStorage.getItem(STORAGE_KEY);
  return citas ? JSON.parse(citas) : [];
}

function guardarCitas(citas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
}

function agregarCita(cita) {
  const citas = obtenerCitas();
  citas.push(cita);
  guardarCitas(citas);
  return cita;
}

// =============================================
// Funciones de Disponibilidad
// =============================================

function obtenerHorariosOcupados(fecha, comuna) {
  const citas = obtenerCitas();
  return citas
    .filter(c => c.fecha === fecha && c.comuna === comuna)
    .map(c => c.hora);
}

function obtenerHorariosDisponibles(fecha, comuna) {
  const horariosOcupados = obtenerHorariosOcupados(fecha, comuna);
  return HORARIOS_BASE.filter(h => !horariosOcupados.includes(h));
}

// =============================================
// Funciones de Turno
// =============================================

function generarNumeroTurno(comuna) {
  const citas = obtenerCitas();
  const año = new Date().getFullYear();
  const citasDelAño = citas.filter(c => {
    const añoCita = new Date(c.fecha).getFullYear();
    return añoCita === año && c.comuna === comuna;
  });
  
  const consecutivo = citasDelAño.length + 1;
  const numeroFormateado = consecutivo.toString().padStart(4, '0');
  
  return `C${comuna}-${año}-${numeroFormateado}`;
}

// =============================================
// Funciones de UI
// =============================================

function mostrarMensaje(texto, tipo = 'error') {
  mensaje.textContent = texto;
  mensaje.className = tipo;
  mensaje.style.display = 'block';
  
  if (tipo === 'success') {
    setTimeout(() => {
      mensaje.style.display = 'none';
    }, 3000);
  }
}

function actualizarHorarios() {
  const fecha = fechaInput.value;
  const comunaSelect = document.getElementById("comuna");
  const comuna = comunaSelect.value;
  
  horaSelect.innerHTML = '<option value="">Seleccione hora...</option>';
  
  if (!fecha) {
    return;
  }
  
  // Validar que no sea fecha pasada
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaSeleccionada = new Date(fecha + "T00:00:00");
  
  if (fechaSeleccionada < hoy) {
    mostrarMensaje("No puede seleccionar una fecha pasada", "error");
    fechaInput.value = "";
    return;
  }
  
  // Obtener horarios disponibles
  const horariosDisponibles = comuna 
    ? obtenerHorariosDisponibles(fecha, comuna)
    : HORARIOS_BASE;
  
  if (horariosDisponibles.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Sin horarios disponibles";
    opt.disabled = true;
    horaSelect.appendChild(opt);
    mostrarMensaje("No hay horarios disponibles para esta fecha", "error");
    return;
  }
  
  horariosDisponibles.forEach(h => {
    const opt = document.createElement("option");
    opt.value = h;
    opt.textContent = h;
    horaSelect.appendChild(opt);
  });
  
  mensaje.style.display = 'none';
}

function configurarFechaMinima() {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  fechaInput.min = `${año}-${mes}-${dia}`;
}

// =============================================
// Validaciones
// =============================================

function validarCedula(cedula) {
  return /^\d{6,10}$/.test(cedula);
}

function validarTelefono(telefono) {
  return /^\d{7,10}$/.test(telefono.replace(/\s/g, ''));
}

function validarDisponibilidad(fecha, hora, comuna) {
  const horariosOcupados = obtenerHorariosOcupados(fecha, comuna);
  return !horariosOcupados.includes(hora);
}

// =============================================
// Event Listeners
// =============================================

fechaInput.addEventListener("change", actualizarHorarios);

document.getElementById("comuna").addEventListener("change", () => {
  if (fechaInput.value) {
    actualizarHorarios();
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Obtener datos del formulario
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  // Validaciones
  if (!validarCedula(data.cedula)) {
    mostrarMensaje("La cédula debe tener entre 6 y 10 dígitos", "error");
    return;
  }
  
  if (!validarTelefono(data.telefono)) {
    mostrarMensaje("El teléfono debe tener entre 7 y 10 dígitos", "error");
    return;
  }
  
  // Verificar disponibilidad una vez más
  if (!validarDisponibilidad(data.fecha, data.hora, data.comuna)) {
    mostrarMensaje("Este horario ya fue reservado. Por favor seleccione otro.", "error");
    actualizarHorarios();
    return;
  }
  
  // Generar número de turno
  const turno = generarNumeroTurno(data.comuna);
  
  // Crear objeto de cita
  const cita = {
    ...data,
    turno: turno,
    fechaRegistro: new Date().toISOString(),
    id: Date.now().toString()
  };
  
  // Guardar cita
  agregarCita(cita);
  
  // Guardar en localStorage para la página de confirmación
  localStorage.setItem("cita_actual", JSON.stringify(cita));
  
  // Redirigir a confirmación
  window.location.href = "confirmacion.html";
});

// =============================================
// Inicialización
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  configurarFechaMinima();
});