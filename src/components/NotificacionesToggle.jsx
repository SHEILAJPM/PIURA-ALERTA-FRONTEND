import { useNotificacionesPush } from "../hooks/useNotificacionesPush";
import Icon from "./Icon";
import { useState } from "react";

function NotificacionesToggle() {
  const { 
    soportado, 
    suscrito, 
    cargando, 
    procesando, 
    error, 
    permiso,
    activar, 
    desactivar,
    probarNotificacion,
  } = useNotificacionesPush();

  const [mostrandoMenu, setMostrandoMenu] = useState(false);
  const [probando, setProbando] = useState(false);

  if (!soportado || cargando) return null;

  const manejarToggle = async () => {
    if (suscrito) {
      await desactivar();
    } else {
      await activar();
    }
  };

  const manejarProbar = async () => {
    setProbando(true);
    await probarNotificacion('general');
    setTimeout(() => setProbando(false), 2000);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={manejarToggle}
        disabled={procesando}
        aria-label={suscrito ? "Desactivar notificaciones de alertas" : "Activar notificaciones de alertas"}
        aria-pressed={suscrito}
        title={suscrito ? "Notificaciones activadas" : "Avisarme cuando cambie el nivel del río"}
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition disabled:opacity-50 relative"
        style={
          suscrito
            ? { backgroundColor: "var(--color-dorado)", color: "var(--color-brand-chrome)" }
            : { backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }
        }
      >
        <Icon name={suscrito ? "bi-bell-fill" : "bi-bell"} aria-hidden="true" />
        {permiso === 'denied' && (
          <span 
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"
            title="Permiso denegado"
          />
        )}
        {procesando && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" 
                  style={{ borderColor: suscrito ? 'var(--color-brand-chrome)' : '#fff' }} />
          </span>
        )}
      </button>

      {suscrito && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-50 overflow-hidden"
             style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <button
            onClick={() => {
              setMostrandoMenu(false);
              manejarProbar();
            }}
            disabled={probando}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            style={{ color: "var(--color-text)" }}
          >
            {probando ? 'Enviando prueba...' : '🔔 Probar notificación'}
          </button>
          <button
            onClick={() => {
              setMostrandoMenu(false);
              desactivar();
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            style={{ color: "var(--color-alerta)" }}
          >
            🔕 Desactivar notificaciones
          </button>
        </div>
      )}

      {error && (
        <div className="absolute right-0 mt-2 w-64 p-3 rounded-lg border text-sm z-50"
             style={{ backgroundColor: "var(--color-alerta-soft)", borderColor: "var(--color-alerta)", color: "var(--color-alerta)" }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default NotificacionesToggle;