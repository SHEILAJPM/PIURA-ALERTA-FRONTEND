import { useEffect, useState } from "react";
import { getUltimaLectura } from "../lib/api";
import { useWebSocketEvent } from "../context/WebSocketContext";

const SENSOR_POR_DEFECTO = "RIO-PIURA-01";
const POLL_MS = 30000;

export function useUltimaLectura(sensorCodigo = SENSOR_POR_DEFECTO) {
  const [lectura, setLectura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function cargar() {
    try {
      const data = await getUltimaLectura(sensorCodigo);
      setLectura(data);
      setError(null);
    } catch (err) {
      // Sin esto, cambiar de sensor y que el nuevo falle deja en pantalla la
      // última lectura del sensor anterior, como si fuera del actual.
      setLectura(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    setLectura(null);
    setError(null);
    cargar();
    const id = setInterval(cargar, POLL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensorCodigo]);

  useWebSocketEvent("lectura", (payload) => {
    if (payload.sensor_codigo !== sensorCodigo) return;
    setLectura((prev) => ({
      ...prev,
      nivel_cm: payload.nivel_cm,
      porcentaje: payload.porcentaje,
      estado: payload.estado,
      medido_en: payload.medido_en,
    }));
  });

  return { lectura, loading, error, recargar: cargar };
}
