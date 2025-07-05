// Acceder al Canvas y a su contexto
const { jsPDF } = window.jspdf;
const canvas = document.getElementById('signaturePad');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearSignature');

// Ajustar tamaño del canvas
function resizeCanvas() {
  const rect = document.querySelector('.signature-box').getBoundingClientRect();
  canvas.width = rect.width - 20;
  canvas.height = rect.height - 20;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fondo blanco
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Variables para dibujar
let drawing = false;

// Eventos para dibujar firma
canvas.addEventListener('mousedown', () => { drawing = true; });
canvas.addEventListener('mouseup', () => {
  drawing = false;
  ctx.beginPath();
});
canvas.addEventListener('mouseout', () => {
  drawing = false;
  ctx.beginPath();
});
canvas.addEventListener('mousemove', draw);

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#000';

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

// Borrar firma
clearBtn.addEventListener('click', () => {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// Función para generar PDF al enviar el formulario
document.getElementById('vehicleForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Obtener datos del formulario
  const nombre = document.getElementById('nombre').value;
  const telefono = document.getElementById('telefono').value;
  const correo = document.getElementById('correo').value;
  const razon = document.getElementById('razon').value;
  const reparacion = document.getElementById('reparacion').value;

  const estado = {
    parabrisas: document.getElementById('parabrisas').value,
    ventanas: document.getElementById('ventanas').value,
    pintura: document.getElementById('pintura').value,
    bumper_tracero: document.getElementById('bumper_tracero').value,
    bumper_delantero: document.getElementById('bumper_delantero').value,
    tapa_motor: document.getElementById('tapa_motor').value,
    cajuela: document.getElementById('cajuela').value,
    asientos: document.getElementById('asientos').value,
    dash: document.getElementById('dash').value,
    llantas: document.getElementById('llantas').value,
  };

  const notas = document.getElementById('notas').value;

  // Convertir firma a imagen PNG
  const firmaDataURL = canvas.toDataURL('image/png');

  // Crear nuevo PDF
  const pdf = new jsPDF();
  let y = 10;

  // Encabezado
  pdf.setFontSize(16);
  pdf.text('AutoGrip - Control de Vehículos', 105, y, null, null, 'center');

  y += 10;
  pdf.setFontSize(12);
  pdf.text(`Nombre del Cliente: ${nombre}`, 10, y);
  pdf.text(`Teléfono: ${telefono}`, 10, y + 6);
  pdf.text(`Correo Electrónico: ${correo}`, 10, y + 12);

  y += 20;
  pdf.setFontSize(14);
  pdf.text('Razón de la Visita:', 10, y);
  y += 6;
  pdf.setFontSize(12);
  pdf.text(razon, 12, y, { maxWidth: 180 });

  y += (razon.split('\n').length + 1) * 6 + 10;
  pdf.setFontSize(14);
  pdf.text('Reparaciones Solicitadas:', 10, y);
  y += 6;
  pdf.setFontSize(12);
  pdf.text(reparacion, 12, y, { maxWidth: 180 });

  y += (reparacion.split('\n').length + 1) * 6 + 10;
  pdf.setFontSize(14);
  pdf.text('Estado del Vehículo:', 10, y);
  y += 6;
  for (const [key, value] of Object.entries(estado)) {
    pdf.setFontSize(12);
    pdf.text(`${key.replace('_', ' ')}: ${value}`, 12, y);
    y += 6;
  }

  y += 10;
  pdf.setFontSize(14);
  pdf.text('Notas:', 10, y);
  y += 6;
  pdf.setFontSize(12);
  pdf.text(notas, 12, y, { maxWidth: 180 });

  y += (notas.split('\n').length + 1) * 6 + 10;
  pdf.setFontSize(14);
  pdf.text('Firma de Recibido:', 10, y);
  y += 10;

  // Agregar firma al PDF
  const imgProps = pdf.getImageProperties(firmaDataURL);
  const pdfWidth = 70;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(firmaDataURL, 'PNG', 10, y, pdfWidth, pdfHeight);
  y += pdfHeight + 10;

  pdf.setFontSize(12);
  pdf.text('Nombre y firma:', 10, y);
  y += 10;
  pdf.line(10, y, 80, y);
  y += 10;

  // ENVIAR PDF AL SERVIDOR EN LUGAR DE DESCARGAR
  pdf.output('datauristring').then((dataUriString) => {
    const base64PDF = dataUriString.split(',')[1];

    fetch('enviar_correo.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        correo_cliente: correo,
        pdfBase64: base64PDF
      })
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        alert('✅ PDF enviado con éxito al cliente y al taller.');
      } else {
        alert('❌ Error al enviar el correo: ' + res.message);
      }
    })
    .catch(err => {
      console.error('Error:', err);
      alert('❌ No se pudo enviar el correo.');
    });
  });
});
