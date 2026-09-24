import { useEffect, useState } from "react";
import { obtenerClavePublicaPush, suscribirPush, desuscribirPush } from "../utilidades/api";

// La Push API entrega la applicationServerKey en base64url; el navegador
// solo acepta Uint8Array, así que hay que convertirla a mano.
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binario = window.atob(base64);
  return Uint8Array.from([...binario].map((c) => c.charCodeAt(0)));
}

const SOPORTADO = typeof navigator !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

// Best-effort: sin geolocalización disponible, sin permiso, o si tarda
// demasiado, se resuelve a null y la suscripción sigue sin ubicación (recibe
// todas las alertas sin filtrar por cercanía, ver notificarCambioEstadoPush
// en el backend) — nunca bloquea la activación de las notificaciones por esto.
function obtenerUbicacion() {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lon: pos.coords.longitude, lat: pos.coords.latitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}

export function useNotificacionesPush() {
  const [suscrito, setSuscrito] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!SOPORTADO) {
      setCargando(false);
      return;
    }
    navigator.serviceWorker.ready
      .then((registro) => registro.pushManager.getSubscription())
      .then((sub) => setSuscrito(sub != null))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  async function activar() {
    if (!SOPORTADO || procesando) return;
    setProcesando(true);
    setError(null);
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        setError("No diste permiso para las notificaciones en el navegador.");
        return;
      }

      const { publicKey } = await obtenerClavePublicaPush();
      if (!publicKey) {
        setError("Las notificaciones push todavía no están disponibles en el servidor.");
        return;
      }

      const registro = await navigator.serviceWorker.ready;
      const suscripcion =
        (await registro.pushManager.getSubscription()) ??
        (await registro.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));

      const ubicacion = await obtenerUbicacion();
      await suscribirPush({ ...suscripcion.toJSON(), ...(ubicacion ?? {}) });
      setSuscrito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  async function desactivar() {
    if (!SOPORTADO || procesando) return;
    setProcesando(true);
    setError(null);
    try {
      const registro = await navigator.serviceWorker.ready;
      const suscripcion = await registro.pushManager.getSubscription();
      if (suscripcion) {
        await desuscribirPush(suscripcion.endpoint);
        await suscripcion.unsubscribe();
      }
      setSuscrito(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  return { soportado: SOPORTADO, suscrito, cargando, procesando, error, activar, desactivar };
}
