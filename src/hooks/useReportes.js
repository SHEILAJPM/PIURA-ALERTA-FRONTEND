import { useEffect, useState } from "react";
import { getReportes, crearReporte, darLike as darLikeApi, actualizarEstadoReporte } from "../lib/api";
import { useWebSocketEvent } from "../context/WebSocketContext";

export function useReportes(limite = 30) {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let activo = true;
    getReportes({ limite })
      .then((data) => activo && setReportes(data))
      .catch((err) => activo && setError(err.message))
      .finally(() => activo && setLoading(false));
    return () => {
      activo = false;
    };
  }, [limite]);

  useWebSocketEvent("reporte_ciudadano", (payload) => {
    setReportes((prev) => [payload, ...prev]);
  });

  async function enviarReporte(datos) {
    setEnviando(true);
    try {
      await crearReporte(datos);
      // el nuevo reporte llega por WebSocket (reporte_ciudadano) y se antepone solo
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setEnviando(false);
    }
  }

  async function darLike(reporteId) {
    const resultado = await darLikeApi(reporteId);
    setReportes((prev) =>
      prev.map((reporte) =>
        reporte.id === reporteId
          ? { ...reporte, likes_count: resultado.likes_count, te_gusta: resultado.te_gusta }
          : reporte
      )
    );
  }

  async function actualizarEstado(reporteId, estado) {
    const resultado = await actualizarEstadoReporte(reporteId, estado);
    setReportes((prev) =>
      prev.map((reporte) =>
        reporte.id === reporteId ? { ...reporte, estado: resultado.estado } : reporte
      )
    );
  }

  return { reportes, loading, error, enviando, enviarReporte, darLike, actualizarEstado };
}
