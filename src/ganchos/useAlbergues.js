import { useCallback, useEffect, useState } from "react";
import { getAlbergues } from "../utilidades/api";
import { useWebSocketEvent } from "../contexto/WebSocketContext";

export function useAlbergues() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const resultado = await getAlbergues();
      setData(resultado);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // En vivo (ver albergues.routes.js): así el mapa y el feed público reflejan
  // un cambio de aforo o un albergue nuevo/quitado sin que nadie tenga que
  // recargar la página en medio de una emergencia.
  useWebSocketEvent("albergue_actualizado", (albergue) => {
    setData((prev) => (prev ?? []).map((a) => (a.id === albergue.id ? { ...a, ...albergue } : a)));
  });

  useWebSocketEvent("albergue_creado", (albergue) => {
    // Idempotente a propósito: quien lo creó ya lo agregó de forma optimista
    // en su propia pestaña (ver Albergues.jsx) antes de que le llegue este
    // mismo evento de vuelta -- sin este chequeo, aparecería duplicado.
    setData((prev) => {
      const lista = prev ?? [];
      if (lista.some((a) => a.id === albergue.id)) return lista;
      return [...lista, albergue].sort((a, b) => a.nombre.localeCompare(b.nombre));
    });
  });

  useWebSocketEvent("albergue_eliminado", ({ id }) => {
    setData((prev) => (prev ?? []).filter((a) => a.id !== id));
  });

  return { data, loading, error, setData, recargar: cargar };
}
