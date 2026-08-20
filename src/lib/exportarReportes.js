const ESTADO_TEXTO = {
  pendiente: "Pendiente de revisión",
  verificado: "Verificado",
  descartado: "Archivado",
};

function formatearFechaCompleta(iso) {
  return new Date(iso).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
}

function escapeHtml(texto) {
  const mapa = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(texto ?? "").replace(/[&<>"']/g, (c) => mapa[c]);
}

function csvEscape(valor) {
  const texto = String(valor ?? "");
  return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

const COLUMNAS_CSV = [
  { titulo: "Fecha", valor: (r) => formatearFechaCompleta(r.creado_en) },
  { titulo: "Autor", valor: (r) => r.usuario_nombre },
  { titulo: "Estado", valor: (r) => ESTADO_TEXTO[r.estado] ?? r.estado },
  { titulo: "Descripción", valor: (r) => r.descripcion },
  { titulo: "Likes", valor: (r) => r.likes_count },
  { titulo: "Posible spam", valor: (r) => (r.posible_spam ? "Sí" : "No") },
  { titulo: "Foto", valor: (r) => r.foto_url ?? "" },
];

function descargarArchivo(nombre, contenido, tipoMime) {
  const blob = new Blob([contenido], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

export function exportarReportesCSV(reportes) {
  const encabezado = COLUMNAS_CSV.map((c) => csvEscape(c.titulo)).join(",");
  const filas = reportes.map((r) => COLUMNAS_CSV.map((c) => csvEscape(c.valor(r))).join(","));
  // BOM al inicio: sin esto Excel abre el archivo interpretando tildes/ñ mal.
  const BOM = "﻿";
  const csv = BOM + [encabezado, ...filas].join("\r\n");
  const fecha = new Date().toISOString().slice(0, 10);
  descargarArchivo(`reportes-piura-alerta-${fecha}.csv`, csv, "text/csv;charset=utf-8");
}

// No se usa una librería de PDF (jsPDF, etc.) para no sumar peso al bundle
// solo por este botón: se arma un documento imprimible en una pestaña nueva
// y se delega en "Guardar como PDF" del diálogo de impresión del navegador,
// que ya sabe generar PDFs reales sin dependencias extra.
export function exportarReportesPDF(reportes, titulo = "Reportes ciudadanos — Piura Alerta") {
  const ventana = window.open("", "_blank", "width=900,height=700");
  if (!ventana) return;

  const filas = reportes
    .map(
      (r) => `
        <tr>
          <td>${formatearFechaCompleta(r.creado_en)}</td>
          <td>${escapeHtml(r.usuario_nombre)}</td>
          <td>${ESTADO_TEXTO[r.estado] ?? r.estado}</td>
          <td>${escapeHtml(r.descripcion)}</td>
          <td>${r.likes_count}</td>
        </tr>`
    )
    .join("");

  ventana.document.write(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(titulo)}</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 24px; color: #16232c; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  p.meta { color: #5b6b76; font-size: 12px; margin-top: 0; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f4f6f8; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<h1>${escapeHtml(titulo)}</h1>
<p class="meta">Generado el ${formatearFechaCompleta(new Date().toISOString())} — ${reportes.length} reportes</p>
<table>
<thead><tr><th>Fecha</th><th>Autor</th><th>Estado</th><th>Descripción</th><th>Likes</th></tr></thead>
<tbody>${filas}</tbody>
</table>
</body>
</html>`);
  ventana.document.close();
  ventana.focus();
  ventana.print();
}
