import { useCallback, useEffect, useState } from "react";
import {
  getReportes,
  crearReporte,
  reaccionarReporte,
  actualizarEstadoReporte,
} from "../lib/api";
import { useWebSocketEvent } from "../context/WebSocketContext";
import {
  encolarReporte,
  contarPendientes,
  reintentarColaReportes,
} from "../lib/colaOffline";

export function useReportes(limite = 30) {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMas, setHayMas] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [pendientes, setPendientes] = useState(() => contarPendientes());

  useEffect(() => {
    let activo = true;
    getReportes({ limite })
      .then((data) => {
        if (!activo) return;
        setReportes(data);
        setHayMas(data.length === limite);
      })
      .catch((err) => activo && setError(err.message))
      .finally(() => activo && setLoading(false));
    return () => {
      activo = false;
    };
  }, [limite]);

  useWebSocketEvent("reporte_ciudadano", (payload) => {
    setReportes((prev) => [payload, ...prev]);
  });

  useWebSocketEvent("reaccion_actualizada", (payload) => {
    setReportes((prev) =>
      prev.map((reporte) =>
        reporte.id === payload.reporte_id
          ? {
              ...reporte,
              reacciones_util: payload.reacciones_util,
              reacciones_alerta: payload.reacciones_alerta,
              reacciones_confirmo: payload.reacciones_confirmo,
              reaccion_usuario: payload.reaccion_usuario,
            }
          : reporte,
      ),
    );
  });

  useWebSocketEvent("reporte_estado_actualizado", (payload) => {
    setReportes((prev) =>
      prev.map((reporte) =>
        reporte.id === payload.reporte_id
          ? { ...reporte, estado: payload.estado }
          : reporte,
      ),
    );
  });

  useEffect(() => {
    function reintentar() {
      reintentarColaReportes(crearReporte).then(() =>
        setPendientes(contarPendientes()),
      );
    }
    reintentar();
    window.addEventListener("online", reintentar);
    return () => window.removeEventListener("online", reintentar);
  }, []);

  const enviarReporte = useCallback(async (datos) => {
    setEnviando(true);
    try {
      await crearReporte(datos);
      setError(null);
      return { encolado: false };
    } catch (err) {
      if (err instanceof TypeError) {
        encolarReporte(datos);
        setPendientes(contarPendientes());
        return { encolado: true };
      }
      setError(err.message);
      throw err;
    } finally {
      setEnviando(false);
    }
  }, []);

  const reaccionar = useCallback(async (reporteId, tipo) => {
    const resultado = await reaccionarReporte(reporteId, tipo);
    setReportes((prev) =>
      prev.map((reporte) =>
        reporte.id === reporteId
          ? {
              ...reporte,
              reacciones_util: resultado.reacciones_util,
              reacciones_alerta: resultado.reacciones_alerta,
              reacciones_confirmo: resultado.reacciones_confirmo,
              reaccion_usuario: resultado.reaccion_usuario,
            }
          : reporte,
      ),
    );
  }, []);

  const actualizarEstado = useCallback(async (reporteId, estado) => {
    const resultado = await actualizarEstadoReporte(reporteId, estado);
    setReportes((prev) =>
      prev.map((reporte) =>
        reporte.id === reporteId
          ? { ...reporte, estado: resultado.estado }
          : reporte,
      ),
    );
  }, []);

  const cargarMas = useCallback(async () => {
    if (cargandoMas || !hayMas || reportes.length === 0) return;
    setCargandoMas(true);
    try {
      const ultimo = reportes[reportes.length - 1];
      const pagina = await getReportes({ limite, antes: ultimo.creado_en });
      setReportes((prev) => [...prev, ...pagina]);
      setHayMas(pagina.length === limite);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoMas(false);
    }
  }, [cargandoMas, hayMas, reportes, limite]);

  return {
    reportes,
    loading,
    error,
    enviando,
    enviarReporte,
    reaccionarReporte: reaccionar,
    actualizarEstado,
    cargarMas,
    cargandoMas,
    hayMas,
    pendientes,
  };
}
