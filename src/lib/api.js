import { obtenerTokenGuardado } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const SENSOR_POR_DEFECTO = "RIO-PIURA-01";

async function apiFetch(path, options) {
  const token = obtenerTokenGuardado();
  const headers = { "Content-Type": "application/json", ...options?.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
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

export function getUltimaLectura(sensorCodigo = SENSOR_POR_DEFECTO) {
  return apiFetch(`/api/lecturas/ultima?sensor=${encodeURIComponent(sensorCodigo)}`);
}

export function getHistorico(sensorCodigo = SENSOR_POR_DEFECTO, minutos = 180) {
  return apiFetch(`/api/lecturas?sensor=${encodeURIComponent(sensorCodigo)}&minutos=${minutos}`);
}

export function getAlbergues() {
  return apiFetch("/api/albergues");
}

export function getZonasRiesgo() {
  return apiFetch("/api/zonas-riesgo");
}

export function getReportes({ limite = 30, conFoto = false } = {}) {
  return apiFetch(`/api/reportes-ciudadanos?limite=${limite}&conFoto=${conFoto}`);
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

export function registrarUsuario({ nombre, dni, telefono, direccion, correo, password }) {
  return apiFetch("/api/auth/registro", {
    method: "POST",
    body: JSON.stringify({ nombre, dni, telefono, direccion, correo, password }),
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
