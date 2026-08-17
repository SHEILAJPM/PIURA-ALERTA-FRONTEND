import { useEffect, useState } from "react";
import { getEstadoSensores } from "../lib/api";
import { useWebSocketEvent } from "../context/WebSocketContext";

const POLL_MS = 30000;

export function useEstadoSensores() {
  const [sensores, setSensores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function cargar() {
    try {
      const data = await getEstadoSensores();
      setSensores(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, POLL_MS);
    return () => clearInterval(id);
  }, []);

  // Cuando llega una lectura nueva por WebSocket, ese sensor está online
  // "ya": no hace falta esperar al próximo poll para reflejarlo.
  useWebSocketEvent("lectura", (payload) => {
    setSensores((prev) =>
      prev?.map((sensor) =>
        sensor.codigo === payload.sensor_codigo
          ? {
              ...sensor,
              en_linea: true,
              ultima_lectura: {
                nivel_cm: payload.nivel_cm,
                estado: payload.estado,
                medido_en: payload.medido_en,
              },
            }
          : sensor
      ) ?? null
    );
  });

  return { sensores, loading, error, recargar: cargar };
}
