import { useEffect, useState } from "react";
import { getEstadoSensores } from "../lib/api";

const POLL_MS = 30000;

export function useEstadoSensores() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const result = await getEstadoSensores();
        if (activo) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (activo) setError(err.message);
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();
    const id = setInterval(cargar, POLL_MS);
    return () => {
      activo = false;
      clearInterval(id);
    };
  }, []);

  return { data, loading, error };
}
