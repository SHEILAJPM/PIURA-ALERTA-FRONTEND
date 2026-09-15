import { useResource } from "./useResource";
import { useWebSocketEvent } from "../contexto/WebSocketContext";
import { getHistorico } from "../utilidades/api";

const SENSOR_POR_DEFECTO = "RIO-PIURA-01";

export function useHistorico(sensorCodigo = SENSOR_POR_DEFECTO, minutos = 180) {
  const {
    data: puntos,
    loading,
    error,
    setData,
  } = useResource(() => getHistorico(sensorCodigo, minutos), [sensorCodigo, minutos]);

  useWebSocketEvent("lectura", (payload) => {
    if (payload.sensor_codigo !== sensorCodigo) return;
    setData((prev) => [
      ...(prev ?? []),
      {
        nivel_cm: payload.nivel_cm,
        porcentaje: payload.porcentaje,
        estado: payload.estado,
        medido_en: payload.medido_en,
      },
    ]);
  });

  return { puntos: puntos ?? [], loading, error };
}
