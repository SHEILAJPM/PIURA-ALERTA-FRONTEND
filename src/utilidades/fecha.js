// Formatos de fecha/hora reusados en varias pantallas (antes cada archivo
// tenía su propia copia casi idéntica). Un nombre por forma real que se usa
// en la app, no un formateador genérico con muchas opciones.

export function formatearHora(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

// "17 ago, 14:30" — el formato más común en tablas/listas del panel admin.
export function formatearFechaHora(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "17 ago 2026" — cuando la hora no aporta (vencimientos, fecha de alta).
export function formatearFecha(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

// "17 ago 2026, 14:30" — historial donde importa el día completo, no solo
// "hace cuánto".
export function formatearFechaHoraCompleta(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "17 de agosto de 2026" — para texto legal/formal (pólizas).
export function formatearFechaLarga(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
}

// Formato corto del navegador (varía con el locale) — export de reportes.
export function formatearFechaHoraCorta(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
}
