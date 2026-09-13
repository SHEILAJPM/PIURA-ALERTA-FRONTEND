import { useState } from "react";
import Icon from "./Icon";

// Estimado ilustrativo (no una norma de ingeniería): ~8 sacos por metro
// lineal a 25cm de altura de muro, escalado linealmente con la altura.
function estimarSacos(longitudM, alturaCm) {
  return Math.ceil(longitudM * 8 * (alturaCm / 25));
}

function CalculadoraSacos() {
  const [longitud, setLongitud] = useState(10);
  const [altura, setAltura] = useState(50);

  const sacos = estimarSacos(Number(longitud) || 0, Number(altura) || 0);

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon name="bi-calculator" style={{ color: "var(--color-primary)" }} aria-hidden="true" />
        <h3 className="font-bold">Calculadora de sacos de arena</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Longitud del muro (m)
          </label>
          <input
            type="number"
            min="0"
            value={longitud}
            onChange={(e) => setLongitud(e.target.value)}
            className="w-24 rounded-lg border px-2 py-1.5 text-sm font-mono-data text-right"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text)",
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Altura deseada (cm)
          </label>
          <input
            type="number"
            min="0"
            value={altura}
            onChange={(e) => setAltura(e.target.value)}
            className="w-24 rounded-lg border px-2 py-1.5 text-sm font-mono-data text-right"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text)",
            }}
          />
        </div>
      </div>

      <div
        className="mt-4 pt-4 border-t flex items-center justify-between"
        style={{ borderColor: "var(--color-border)" }}
      >
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Sacos estimados
        </span>
        <strong className="text-2xl font-mono-data" style={{ color: "var(--color-primary)" }}>
          {sacos.toLocaleString("es-PE")}
        </strong>
      </div>
      <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
        Estimado referencial, no reemplaza la evaluación de Defensa Civil en campo.
      </p>
    </div>
  );
}

export default CalculadoraSacos;
