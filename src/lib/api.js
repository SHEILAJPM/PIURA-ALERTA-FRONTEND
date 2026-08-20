import { obtenerTokenGuardado, dispararSesionExpirada } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const SENSOR_POR_DEFECTO = "RIO-PIURA-01";

async function apiFetch(path, options) {
  const token = obtenerTokenGuardado();
  const headers = { "Content-Type": "application/json", ...options?.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // Un 401 con token adjunto es una sesión que se creía válida y ya no lo
    // es (expiró, o cambió de rol y el token viejo quedó corto de permisos
    // en una ruta que sí exige sesión) — no un intento de login fallido, ese
    // nunca manda token. Cerrar sesión acá evita que seguir intentando otras
    // acciones muestre el mismo error uno por uno.
    if (res.status === 401 && token) {
      dispararSesionExpirada();
    }
    throw new Error(body.error ?? `Error ${res.status} al consultar ${path}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function getSalud() {
  return apiFetch("/health");
}

export function getSensores() {
  return apiFetch("/api/sensores");
}

export function getEstadoSensores() {
  return apiFetch("/api/sensores/estado");
}

export function getUltimaLectura(sensorCodigo = SENSOR_POR_DEFECTO) {
  return apiFetch(`/api/lecturas/ultima?sensor=${encodeURIComponent(sensorCodigo)}`);
}

export function getHistorico(sensorCodigo = SENSOR_POR_DEFECTO, minutos = 180) {
  return apiFetch(`/api/lecturas?sensor=${encodeURIComponent(sensorCodigo)}&minutos=${minutos}`);
}

export function getAlbergues() {
  return apiFetch("/api/albergues");
}

export function actualizarOcupacionAlbergue(albergueId, ocupacionActual) {
  return apiFetch(`/api/albergues/${albergueId}/ocupacion`, {
    method: "PATCH",
    body: JSON.stringify({ ocupacion_actual: ocupacionActual }),
  });
}

export function getZonasRiesgo() {
  return apiFetch("/api/zonas-riesgo");
}

export function getReportes({ limite = 30, conFoto = false, antes } = {}) {
  const params = new URLSearchParams({ limite: String(limite), conFoto: String(conFoto) });
  if (antes) params.set("antes", antes);
  return apiFetch(`/api/reportes-ciudadanos?${params}`);
}

export function crearReporte({ autor_nombre, descripcion, foto_url, lon, lat }) {
  return apiFetch("/api/reportes-ciudadanos", {
    method: "POST",
    body: JSON.stringify({ autor_nombre, descripcion, foto_url, lon, lat }),
  });
}

export function darLike(reporteId) {
  return apiFetch(`/api/reportes-ciudadanos/${reporteId}/like`, { method: "POST" });
}

export function actualizarEstadoReporte(reporteId, estado) {
  return apiFetch(`/api/reportes-ciudadanos/${reporteId}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}

export function registrarUsuario({
  nombre,
  dni,
  telefono,
  direccion,
  correo,
  password,
  recibir_alertas_sms,
}) {
  return apiFetch("/api/auth/registro", {
    method: "POST",
    body: JSON.stringify({ nombre, dni, telefono, direccion, correo, password, recibir_alertas_sms }),
  });
}

export function iniciarSesion({ correo, password }) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ correo, password }),
  });
}

export function obtenerPerfil() {
  return apiFetch("/api/auth/yo");
}

export function actualizarPerfil({ nombre, telefono, direccion, recibir_alertas_sms, sensor_interes_id }) {
  const body = { nombre, telefono, direccion, recibir_alertas_sms };
  // sensor_interes_id es undefined ("no tocar") o null/uuid ("tocar") — solo
  // se agrega al body cuando el llamador lo pasó, para no mandar la clave de
  // más y que el backend la confunda con "quiero volver a todos los sensores".
  if (sensor_interes_id !== undefined) body.sensor_interes_id = sensor_interes_id;
  return apiFetch("/api/auth/yo", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function olvidarPassword(correo) {
  return apiFetch("/api/auth/olvide-password", {
    method: "POST",
    body: JSON.stringify({ correo }),
  });
}

export function restablecerPassword({ token, passwordNueva }) {
  return apiFetch("/api/auth/restablecer-password", {
    method: "POST",
    body: JSON.stringify({ token, passwordNueva }),
  });
}

export function cambiarPassword({ passwordActual, passwordNueva }) {
  return apiFetch("/api/auth/contrasena", {
    method: "PATCH",
    body: JSON.stringify({ passwordActual, passwordNueva }),
  });
}

export function getUsuarios() {
  return apiFetch("/api/usuarios");
}

export function actualizarRolUsuario(usuarioId, rol) {
  return apiFetch(`/api/usuarios/${usuarioId}/rol`, {
    method: "PATCH",
    body: JSON.stringify({ rol }),
  });
}

export function getAuditoria(limite = 100) {
  return apiFetch(`/api/auditoria?limite=${limite}`);
}

export function getTickets() {
  return apiFetch("/api/tickets");
}

export function crearTicket({ sensor_id, titulo, descripcion, prioridad }) {
  return apiFetch("/api/tickets", {
    method: "POST",
    body: JSON.stringify({ sensor_id, titulo, descripcion, prioridad }),
  });
}

export function actualizarEstadoTicket(ticketId, estado) {
  return apiFetch(`/api/tickets/${ticketId}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}

export function crearSensor({ codigo, nombre, lon, lat, nivel_prealerta_cm, nivel_alerta_roja_cm }) {
  return apiFetch("/api/sensores", {
    method: "POST",
    body: JSON.stringify({ codigo, nombre, lon, lat, nivel_prealerta_cm, nivel_alerta_roja_cm }),
  });
}

export function actualizarCalibracionSensor(sensorId, { nivel_prealerta_cm, nivel_alerta_roja_cm }) {
  return apiFetch(`/api/sensores/${sensorId}`, {
    method: "PATCH",
    body: JSON.stringify({ nivel_prealerta_cm, nivel_alerta_roja_cm }),
  });
}

export function difundirAlertaManual(mensaje) {
  return apiFetch("/api/alertas/difundir", {
    method: "POST",
    body: JSON.stringify({ mensaje }),
  });
}

export function obtenerClavePublicaPush() {
  return apiFetch("/api/push/clave-publica");
}

export function suscribirPush(subscription) {
  return apiFetch("/api/push/suscribir", {
    method: "POST",
    body: JSON.stringify(subscription),
  });
}

export function desuscribirPush(endpoint) {
  return apiFetch("/api/push/desuscribir", {
    method: "POST",
    body: JSON.stringify({ endpoint }),
  });
}

export function getHistorialAlertas(limite = 30) {
  return apiFetch(`/api/alertas/historial?limite=${limite}`);
}
