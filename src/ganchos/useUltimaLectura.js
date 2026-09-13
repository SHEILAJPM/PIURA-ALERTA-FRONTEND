import { useEffect, useState } from "react";
import { getUltimaLectura } from "../utilidades/api";
import { useWebSocketEvent } from "../contexto/WebSocketContext";

const SENSOR_POR_DEFECTO = "RIO-PIURA-01";
const POLL_MS = 30000;

export function useUltimaLectura(sensorCodigo = SENSOR_POR_DEFECTO) {
  const [lectura, setLectura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Aparte del mensaje: un sensor recién agregado sin lecturas todavía (404)
  // es un estado normal, no una falla de conexión. Se distingue por el
  // código HTTP, no comparando el texto exacto del mensaje (eso se rompe en
  // silencio si el backend cambia una palabra de ese error).
  const [sinLecturas, setSinLecturas] = useState(false);

  async function cargar() {
    try {
      const data = await getUltimaLectura(sensorCodigo);
      setLectura(data);
      setError(null);
      setSinLecturas(false);
    } catch (err) {
      // Sin esto, cambiar de sensor y que el nuevo falle deja en pantalla la
      // última lectura del sensor anterior, como si fuera del actual.
      setLectura(null);
      setError(err.message);
      setSinLecturas(err.status === 404);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    setLectura(null);
    setError(null);
    setSinLecturas(false);
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

  return { lectura, loading, error, sinLecturas, recargar: cargar };
}
