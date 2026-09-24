import { useMemo, useState } from "react";
import { distanciaKm as calcularDistanciaKm } from "../lib/geo";

// No persiste entre sesiones a propósito: la ubicación del navegador puede
// quedar desactualizada (otro lugar, otro día) y no tiene sentido ordenar
// por una posición vieja sin que el usuario la vuelva a pedir.
export function useOrdenPorCercania(reportes) {
  const [activo, setActivo] = useState(false);
  const [ubicacion, setUbicacion] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState(null);

  function activar() {
    if (ubicacion) {
      setActivo(true);
      return;
    }
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }
    setBuscando(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({ lon: pos.coords.longitude, lat: pos.coords.latitude });
        setActivo(true);
        setBuscando(false);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Bloqueaste el permiso de ubicación en el navegador."
            : "No se pudo obtener tu ubicación."
        );
        setBuscando(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  function desactivar() {
    setActivo(false);
  }

  const reportesOrdenados = useMemo(() => {
    if (!activo || !ubicacion) return reportes.map((r) => ({ reporte: r, distanciaKm: null }));
    return reportes
      .map((r) => {
        const coords = r.ubicacion?.coordinates;
        const distancia = coords
          ? calcularDistanciaKm(ubicacion.lat, ubicacion.lon, coords[1], coords[0])
          : null;
        return { reporte: r, distanciaKm: distancia };
      })
      .sort((a, b) => {
        if (a.distanciaKm == null && b.distanciaKm == null) return 0;
        if (a.distanciaKm == null) return 1;
        if (b.distanciaKm == null) return -1;
        return a.distanciaKm - b.distanciaKm;
      });
  }, [reportes, activo, ubicacion]);

  return { activo, buscando, error, activar, desactivar, reportesOrdenados };
}
