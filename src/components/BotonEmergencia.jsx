import { useState } from "react";
import { useModalA11y } from "../hooks/useModalA11y";
import { emergencyContacts } from "../data/content";
import Icon from "./Icon";

function DialogoEmergencia({ onCerrar }) {
  const contenedorRef = useModalA11y(onCerrar);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onCerrar}
    >
      <div
        ref={contenedorRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergencia-titulo"
        tabIndex={-1}
        className="w-full max-w-sm rounded-2xl border p-6 outline-none"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h3
            id="emergencia-titulo"
            className="text-lg font-bold flex items-center gap-2"
            style={{ color: "var(--color-alerta)" }}
          >
            <Icon name="bi-exclamation-triangle-fill" aria-hidden="true" />
            Números de emergencia
          </h3>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="text-xl leading-none"
            style={{ color: "var(--color-text-muted)" }}
          >
            ×
          </button>
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
          Si es una emergencia real, llama directamente. No esperes a que la app confirme nada.
        </p>

        <ul className="space-y-2">
          {emergencyContacts.map((c) => (
            <li key={c.numero}>
              <a
                href={`tel:${c.numero}`}
                className="flex items-center justify-between rounded-xl px-4 py-3 font-semibold transition"
                style={{ backgroundColor: "var(--color-alerta-soft)", color: "var(--color-alerta)" }}
              >
                {c.nombre}
                <span className="font-mono-data text-lg">{c.numero}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BotonEmergencia() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Ver números de emergencia"
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl text-white animate-pulse-alert"
        style={{ backgroundColor: "var(--color-alerta)" }}
      >
        <Icon name="bi-exclamation-triangle-fill" aria-hidden="true" />
      </button>
      {abierto && <DialogoEmergencia onCerrar={() => setAbierto(false)} />}
    </>
  );
}

export default BotonEmergencia;
