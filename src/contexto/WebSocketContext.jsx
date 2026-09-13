import { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext(null);
const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:4000";
const RECONEXION_MAX_MS = 15000;

export function WebSocketProvider({ children }) {
  const [status, setStatus] = useState("connecting");
  const listenersRef = useRef(new Map());

  useEffect(() => {
    let socket;
    let reintentoMs = 1000;
    let timeoutId;
    let cerrado = false;

    function conectar() {
      setStatus("connecting");
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        reintentoMs = 1000;
        setStatus("open");
      };

      socket.onmessage = (event) => {
        try {
          const { tipo, payload } = JSON.parse(event.data);
          const handlers = listenersRef.current.get(tipo);
          handlers?.forEach((handler) => handler(payload));
        } catch {
          // mensaje no-JSON o inesperado: se ignora
        }
      };

      socket.onclose = () => {
        if (cerrado) return;
        setStatus("closed");
        timeoutId = setTimeout(conectar, reintentoMs);
        reintentoMs = Math.min(reintentoMs * 2, RECONEXION_MAX_MS);
      };

      socket.onerror = () => socket.close();
    }

    conectar();
    return () => {
      cerrado = true;
      clearTimeout(timeoutId);
      socket?.close();
    };
  }, []);

  function subscribe(tipo, handler) {
    if (!listenersRef.current.has(tipo)) listenersRef.current.set(tipo, new Set());
    listenersRef.current.get(tipo).add(handler);
    return () => listenersRef.current.get(tipo)?.delete(handler);
  }

  return <WebSocketContext.Provider value={{ status, subscribe }}>{children}</WebSocketContext.Provider>;
}

export function useWebSocketStatus() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocketStatus debe usarse dentro de WebSocketProvider");
  return ctx.status;
}

export function useWebSocketEvent(tipo, handler) {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocketEvent debe usarse dentro de WebSocketProvider");
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return ctx.subscribe(tipo, (payload) => handlerRef.current(payload));
  }, [tipo, ctx]);
}
