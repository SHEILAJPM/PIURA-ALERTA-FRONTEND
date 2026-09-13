import { useEffect, useState } from "react";
import { getHistorico } from "../utilidades/api";
import { useWebSocketEvent } from "../contexto/WebSocketContext";

const SENSOR_POR_DEFECTO = "RIO-PIURA-01";

export function useHistorico(sensorCodigo = SENSOR_POR_DEFECTO, minutos = 180) {
  const [puntos, setPuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    setLoading(true);
    getHistorico(sensorCodigo, minutos)
      .then((data) => {
        if (activo) {
          setPuntos(data);
          setError(null);
        }
      })
      .catch((err) => activo && setError(err.message))
      .finally(() => activo && setLoading(false));
    return () => {
      activo = false;
    };
  }, [sensorCodigo, minutos]);

  useWebSocketEvent("lectura", (payload) => {
    if (payload.sensor_codigo !== sensorCodigo) return;
    setPuntos((prev) => [
      ...prev,
      {
        nivel_cm: payload.nivel_cm,
        porcentaje: payload.porcentaje,
        estado: payload.estado,
        medido_en: payload.medido_en,
      },
    ]);
  });

  return { puntos, loading, error };
}
