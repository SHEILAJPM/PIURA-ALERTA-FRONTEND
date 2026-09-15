import { useEffect, useState } from "react";
import { obtenerClavePublicaPush, suscribirPush, desuscribirPush } from "../lib/api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binario = window.atob(base64);
  return Uint8Array.from([...binario].map((c) => c.charCodeAt(0)));
}

const SOPORTADO = typeof navigator !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

export function useNotificacionesPush() {
  const [suscrito, setSuscrito] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);
  const [permiso, setPermiso] = useState(null);

  useEffect(() => {
    if (!SOPORTADO) {
      setCargando(false);
      return;
    }
    
    setPermiso(Notification.permission);
    
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
      setPermiso(permiso);
      
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

      await suscribirPush(suscripcion.toJSON());
      setSuscrito(true);
      
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          await registro.sync.register('sync-reportes');
        } catch {}
      }
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

  async function probarNotificacion(tipo = 'general') {
    if (!suscrito) {
      setError('Primero debes activar las notificaciones.');
      return;
    }

    try {
      const registro = await navigator.serviceWorker.ready;
      
      const mensajes = {
        alerta_roja: {
          titulo: '🚨 ALERTA ROJA - Prueba',
          cuerpo: 'Esta es una notificación de prueba para alerta roja.',
        },
        reporte_verificado: {
          titulo: '✅ Reporte verificado',
          cuerpo: 'Tu reporte cercano ha sido verificado por Defensa Civil.',
        },
        general: {
          titulo: '🔔 Piura Alerta',
          cuerpo: 'Las notificaciones funcionan correctamente.',
        },
      };

      const msg = mensajes[tipo] || mensajes.general;
      
      await registro.showNotification(msg.titulo, {
        body: msg.cuerpo,
        icon: '/pwa-192.png',
        badge: '/pwa-192.png',
        tag: `test-${Date.now()}`,
        vibrate: [100, 50, 100],
        data: { url: '/' },
      });
      
      return true;
    } catch (err) {
      setError('No se pudo enviar la notificación de prueba.');
      return false;
    }
  }

  return { 
    soportado: SOPORTADO, 
    suscrito, 
    cargando, 
    procesando, 
    error, 
    permiso,
    activar, 
    desactivar,
    probarNotificacion,
  };
}