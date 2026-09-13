import { useCallback, useEffect, useRef, useState } from "react";

export function useResource(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Cada llamada a cargar() se numera; si para cuando resuelve ya hay una
  // llamada más nueva en curso (ej. cambiaron las deps antes de que la
  // primera terminara), se descarta en vez de pisar el estado con una
  // respuesta vieja que puede llegar después de la nueva.
  const generacionRef = useRef(0);

  const cargar = useCallback(async () => {
    const miGeneracion = ++generacionRef.current;
    setLoading(true);
    try {
      const result = await fetchFn();
      if (miGeneracion !== generacionRef.current) return;
      setData(result);
      setError(null);
    } catch (err) {
      if (miGeneracion !== generacionRef.current) return;
      setError(err.message);
    } finally {
      if (miGeneracion === generacionRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { data, loading, error, recargar: cargar, setData };
}
