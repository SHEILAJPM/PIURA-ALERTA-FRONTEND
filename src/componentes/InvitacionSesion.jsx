import { useEffect, useState } from "react";
import { useAuth } from "../contexto/AuthContext";
import Icon from "./Icon";

const ESPERA_MS = 60_000;
const CLAVE_DESCARTADA = "piura-alerta-invitacion-sesion-descartada";

// Invitación flotante a iniciar sesión/registrarse para quien lleva un
// minuto navegando sin cuenta. No es un modal (no bloquea la página): es una
// tarjeta que flota sobre el contenido, se puede ignorar, y una vez cerrada
// no vuelve a insistir en la misma pestaña (sessionStorage, no localStorage
// -- en la próxima visita real sí puede volver a aparecer).
function InvitacionSesion() {
  const { usuario, abrirModal } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (usuario || sessionStorage.getItem(CLAVE_DESCARTADA)) return;
    const id = setTimeout(() => setVisible(true), ESPERA_MS);
    return () => clearTimeout(id);
  }, [usuario]);

  function cerrar() {
    sessionStorage.setItem(CLAVE_DESCARTADA, "1");
    setVisible(false);
  }

  function abrir(modo) {
    abrirModal(modo);
    cerrar();
  }

  if (usuario || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Invitación a iniciar sesión"
      className="fixed z-40 bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-80 rounded-2xl border shadow-lg p-4"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <button
        type="button"
        onClick={cerrar}
        aria-label="Cerrar"
        className="absolute top-2.5 right-2.5 p-1"
        style={{ color: "var(--color-text-muted)" }}
      >
        <Icon name="bi-x-lg" aria-hidden="true" />
      </button>

      <div className="flex items-start gap-3 pr-4">
        <span
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--color-primary-soft)", color: "var(--color-primary)" }}
        >
          <Icon name="bi-person-badge" aria-hidden="true" />
        </span>
        <div>
          <p className="font-bold text-sm">¿Ya tienes cuenta?</p>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Inicia sesión para que tus reportes queden a tu nombre y puedas recibir alertas.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={() => abrir("login")}
          className="flex-1 text-sm font-semibold py-2 rounded-lg text-white"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => abrir("registro")}
          className="flex-1 text-sm font-semibold py-2 rounded-lg border"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          Registrarme
        </button>
      </div>
    </div>
  );
}

export default InvitacionSesion;
