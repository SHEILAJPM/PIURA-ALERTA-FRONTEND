import { useCallback, useEffect, useState } from "react";
import { getReportes, crearReporte, darLike as darLikeApi, actualizarEstadoReporte } from "../lib/api";
import { useWebSocketEvent } from "../context/WebSocketContext";
import { encolarReporte, contarPendientes, reintentarColaReportes } from "../lib/colaOffline";

export function useReportes(limite = 30) {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  // Si la primera página llega completa (== limite), asumimos que puede haber
  // más hasta que una página venga corta — evita un COUNT(*) aparte solo para
  // saber si mostrar el botón "Cargar más".
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

  // Reintenta lo que quedó pendiente de una sesión sin conexión: al montar
  // (por si se recargó la página ya con internet) y cada vez que el
  // navegador avisa que volvió a conectarse.
  useEffect(() => {
    function reintentar() {
      reintentarColaReportes(crearReporte).then(() => setPendientes(contarPendientes()));
    }
    reintentar();
    window.addEventListener("online", reintentar);
    return () => window.removeEventListener("online", reintentar);
  }, []);

  const enviarReporte = useCallback(async (datos) => {
    setEnviando(true);
    try {
      await crearReporte(datos);
      // el nuevo reporte llega por WebSocket (reporte_ciudadano) y se antepone solo
      setError(null);
      return { encolado: false };
    } catch (err) {
      // TypeError = el fetch ni siquiera consiguió respuesta (sin conexión),
      // a diferencia de un 400/500 real del servidor, que sí llega como
      // Error normal con mensaje — ver apiFetch en lib/api.js.
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

  const darLike = useCallback(async (reporteId) => {
    const resultado = await darLikeApi(reporteId);
    setReportes((prev) =>
      prev.map((reporte) =>
        reporte.id === reporteId
          ? { ...reporte, likes_count: resultado.likes_count, te_gusta: resultado.te_gusta }
          : reporte
      )
    );
  }, []);

  const actualizarEstado = useCallback(async (reporteId, estado) => {
    const resultado = await actualizarEstadoReporte(reporteId, estado);
    setReportes((prev) =>
      prev.map((reporte) => (reporte.id === reporteId ? { ...reporte, estado: resultado.estado } : reporte))
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
    darLike,
    actualizarEstado,
    cargarMas,
    cargandoMas,
    hayMas,
    pendientes,
  };
}
