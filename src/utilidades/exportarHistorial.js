import { formatearFechaHoraCorta } from "./fecha";

const ESTADO_TEXTO = {
  normal: "Normal",
  prealerta: "Prealerta",
  alerta_roja: "Alerta roja",
};

function escapeHtml(texto) {
  const mapa = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(texto ?? "").replace(/[&<>"']/g, (c) => mapa[c]);
}

function csvEscape(valor) {
  const texto = String(valor ?? "");
  return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

const COLUMNAS_CSV = [
  { titulo: "Fecha", valor: (e) => formatearFechaHoraCorta(e.iniciado_en) },
  { titulo: "Sensor", valor: (e) => e.sensor_nombre },
  {
    titulo: "Estado anterior",
    valor: (e) => (e.estado_anterior ? (ESTADO_TEXTO[e.estado_anterior] ?? e.estado_anterior) : ""),
  },
  { titulo: "Estado nuevo", valor: (e) => ESTADO_TEXTO[e.estado_nuevo] ?? e.estado_nuevo },
  { titulo: "Nivel (cm)", valor: (e) => e.nivel_cm },
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

export function exportarHistorialCSV(eventos) {
  const encabezado = COLUMNAS_CSV.map((c) => csvEscape(c.titulo)).join(",");
  const filas = eventos.map((e) => COLUMNAS_CSV.map((c) => csvEscape(c.valor(e))).join(","));
  // BOM al inicio: sin esto Excel abre el archivo interpretando tildes/ñ mal.
  const BOM = "﻿";
  const csv = BOM + [encabezado, ...filas].join("\r\n");
  const fecha = new Date().toISOString().slice(0, 10);
  descargarArchivo(`historial-alertas-piura-alerta-${fecha}.csv`, csv, "text/csv;charset=utf-8");
}

// Mismo enfoque que exportarReportesPDF (ver exportarReportes.js): sin
// librería de PDF, se arma un documento imprimible y se delega en "Guardar
// como PDF" del diálogo de impresión del navegador.
export function exportarHistorialPDF(eventos, titulo = "Historial de alertas — Piura Alerta") {
  const ventana = window.open("", "_blank", "width=900,height=700");
  if (!ventana) return;

  const filas = eventos
    .map(
      (e) => `
        <tr>
          <td>${formatearFechaHoraCorta(e.iniciado_en)}</td>
          <td>${escapeHtml(e.sensor_nombre)}</td>
          <td>${e.estado_anterior ? escapeHtml(ESTADO_TEXTO[e.estado_anterior] ?? e.estado_anterior) : "—"}</td>
          <td>${escapeHtml(ESTADO_TEXTO[e.estado_nuevo] ?? e.estado_nuevo)}</td>
          <td>${e.nivel_cm}</td>
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
<p class="meta">Generado el ${formatearFechaHoraCorta(new Date().toISOString())} — ${eventos.length} eventos</p>
<table>
<thead><tr><th>Fecha</th><th>Sensor</th><th>Estado anterior</th><th>Estado nuevo</th><th>Nivel (cm)</th></tr></thead>
<tbody>${filas}</tbody>
</table>
</body>
</html>`);
  ventana.document.close();
  ventana.focus();
  ventana.print();
}
