import { useEffect, useRef, useState } from "react";
import { getUltimaLectura } from "../lib/api";
import { useWebSocketEvent } from "../context/WebSocketContext";

const SENSOR_POR_DEFECTO = "RIO-PIURA-01";
const POLL_MS = 30000;

export function useUltimaLectura(sensorCodigo = SENSOR_POR_DEFECTO) {
  const [lectura, setLectura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const primeraCarga = useRef(true);

  async function cargar() {
    try {
      const data = await getUltimaLectura(sensorCodigo);
      setLectura(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (primeraCarga.current) {
        setLoading(false);
        primeraCarga.current = false;
      }
    }
  }

  useEffect(() => {
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
