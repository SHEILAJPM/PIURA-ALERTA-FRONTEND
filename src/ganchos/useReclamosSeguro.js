import { useEffect, useRef } from "react";
import { useResource } from "./useResource";
import { useWebSocketEvent, useWebSocketStatus } from "../contexto/WebSocketContext";
import { getMisReclamosSeguro, getReclamosSeguro } from "../utilidades/api";

export function useMisReclamosSeguro() {
  return useResource(getMisReclamosSeguro, []);
}

// Mismo patrón que useAlertasSOS: refresca al reconectar (por si se perdió
// algo mientras el socket estaba caído) y agrega en vivo lo que llega
// mientras la pestaña está abierta -- sin esto, un administrador viendo el
// panel no se entera de un reclamo nuevo hasta recargar la página a mano.
export function useReclamosSeguroAdmin() {
  const recurso = useResource(getReclamosSeguro, []);
  const status = useWebSocketStatus();
  const yaAbrioUnaVez = useRef(false);

  useEffect(() => {
    if (status !== "open") return;
    if (yaAbrioUnaVez.current) {
      recurso.recargar();
    }
    yaAbrioUnaVez.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useWebSocketEvent("reclamo_seguro_creado", (reclamo) => {
    recurso.setData((prev) => {
      const lista = prev ?? [];
      if (lista.some((r) => r.id === reclamo.id)) return lista;
      return [reclamo, ...lista];
    });
  });

  return recurso;
}
