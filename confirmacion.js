/**
 * CitaComuna - Página de Confirmación
 * Genera imagen descargable del comprobante de cita
 */

// =============================================
// Cargar datos de la cita
// =============================================

function cargarDatosCita() {
  const citaJSON = localStorage.getItem("cita_actual");
  
  if (!citaJSON) {
    alert("No se encontró información de la cita. Redirigiendo...");
    window.location.href = "index.html";
    return null;
  }
  
  return JSON.parse(citaJSON);
}

function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr + "T00:00:00");
  const opciones = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return fecha.toLocaleDateString('es-CO', opciones);
}

function mostrarDatos(cita) {
  document.getElementById("turnoDisplay").textContent = `Turno: ${cita.turno}`;
  document.getElementById("nombreDisplay").textContent = cita.nombre;
  document.getElementById("cedulaDisplay").textContent = cita.cedula;
  document.getElementById("edadDisplay").textContent = `${cita.edad} años`;
  document.getElementById("telefonoDisplay").textContent = cita.telefono;
  document.getElementById("direccionDisplay").textContent = cita.direccion;
  document.getElementById("comunaDisplay").textContent = `Comuna ${cita.comuna}`;
  document.getElementById("fechaDisplay").textContent = formatearFecha(cita.fecha);
  document.getElementById("horaDisplay").textContent = cita.hora;
}

// =============================================
// Generar y descargar imagen
// =============================================

async function descargarImagen() {
  const card = document.getElementById("cardToCapture");
  const btn = document.getElementById("btnDescargar");
  
  // Mostrar estado de carga
  btn.textContent = "⏳ Generando...";
  btn.disabled = true;
  
  try {
    // Configuración de html2canvas
    const canvas = await html2canvas(card, {
      scale: 2, // Mayor calidad
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: card.offsetWidth,
      height: card.offsetHeight
    });
    
    // Convertir a imagen
    const imagen = canvas.toDataURL("image/png", 1.0);
    
    // Crear link de descarga
    const link = document.createElement("a");
    const cita = cargarDatosCita();
    const nombreArchivo = `cita_${cita.turno.replace(/-/g, '_')}.png`;
    
    link.download = nombreArchivo;
    link.href = imagen;
    link.click();
    
    // Restaurar botón
    btn.textContent = "📥 Descargar Comprobante";
    btn.disabled = false;
    
  } catch (error) {
    console.error("Error al generar imagen:", error);
    alert("Hubo un error al generar la imagen. Por favor use la opción de imprimir.");
    btn.textContent = "📥 Descargar Comprobante";
    btn.disabled = false;
  }
}

// =============================================
// Inicialización
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  const cita = cargarDatosCita();
  
  if (cita) {
    mostrarDatos(cita);
    
    // Configurar botón de descarga
    document.getElementById("btnDescargar").addEventListener("click", descargarImagen);
  }
});
