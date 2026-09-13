import { useResource } from "./useResource";
import { useWebSocketEvent } from "../contexto/WebSocketContext";
import { getAlertasSOS } from "../utilidades/api";

export function useAlertasSOS({ incluirAtendidas = false } = {}) {
  const recurso = useResource(() => getAlertasSOS({ incluirAtendidas }), [incluirAtendidas]);

  // En vivo (ver sos.routes.js): la Consola de Despacho tiene que enterarse
  // de un SOS nuevo al instante, no en el próximo refresco de la página.
  useWebSocketEvent("alerta_sos", (alerta) => {
    recurso.setData((prev) => {
      const lista = prev ?? [];
      if (lista.some((a) => a.id === alerta.id)) return lista;
      return [alerta, ...lista];
    });
  });

  useWebSocketEvent("alerta_sos_actualizada", (actualizada) => {
    recurso.setData((prev) =>
      (prev ?? [])
        .map((a) => (a.id === actualizada.id ? { ...a, ...actualizada } : a))
        // sin incluirAtendidas, una que se marca atendida tiene que desaparecer
        // de la lista en vivo, no quedarse mostrada como pendiente resuelta.
        .filter((a) => incluirAtendidas || a.estado === "pendiente")
    );
  });

  return recurso;
}
