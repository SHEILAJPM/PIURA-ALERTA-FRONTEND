import { useCallback, useEffect, useState } from "react";
import {
  getReportes,
  crearReporte,
  darLike as darLikeApi,
  confirmarReporte as confirmarReporteApi,
  actualizarEstadoReporte,
} from "../utilidades/api";
import { useWebSocketEvent } from "../contexto/WebSocketContext";
import { useAuth } from "../contexto/AuthContext";
import { encolarReporte, contarPendientes, reintentarColaReportes } from "../utilidades/colaOffline";

export function useReportes(limite = 30, { incluirArchivados = false, soloMios = false } = {}) {
  const { usuario } = useAuth();
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
    getReportes({ limite, incluirArchivados, soloMios })
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
  }, [limite, incluirArchivados, soloMios]);

  useWebSocketEvent("reporte_ciudadano", (payload) => {
    // "Mis reportes" (soloMios) no debe inflarse con reportes ajenos que
    // lleguen en vivo -- el WS transmite a todos por igual, sin filtrar por
    // usuario_id (ver POST /api/reportes-ciudadanos en el backend).
    if (soloMios && payload.usuario_id !== usuario?.id) return;
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
      const creado = await crearReporte(datos);
      // Si no lo archivó la IA, el reporte llega por WebSocket (reporte_ciudadano)
      // y se antepone solo; uno archivado nunca se transmite (ver backend), así
      // que acá es la única forma de que quien lo mandó se entere.
      setError(null);
      return { encolado: false, archivado: creado.estado === "descartado" };
    } catch (err) {
      // TypeError = el fetch ni siquiera consiguió respuesta (sin conexión),
      // a diferencia de un 400/500 real del servidor, que sí llega como
      // Error normal con mensaje — ver apiFetch en utilidades/api.js.
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

  const confirmarReporte = useCallback(async (reporteId) => {
    const resultado = await confirmarReporteApi(reporteId);
    setReportes((prev) =>
      prev.map((reporte) =>
        reporte.id === reporteId
          ? {
              ...reporte,
              confirmaciones_count: resultado.confirmaciones_count,
              tu_confirmaste: resultado.tu_confirmaste,
            }
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
      const pagina = await getReportes({ limite, antes: ultimo.creado_en, incluirArchivados, soloMios });
      setReportes((prev) => [...prev, ...pagina]);
      setHayMas(pagina.length === limite);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoMas(false);
    }
  }, [cargandoMas, hayMas, reportes, limite, incluirArchivados, soloMios]);

  return {
    reportes,
    loading,
    error,
    enviando,
    enviarReporte,
    darLike,
    confirmarReporte,
    actualizarEstado,
    cargarMas,
    cargandoMas,
    hayMas,
    pendientes,
  };
}
