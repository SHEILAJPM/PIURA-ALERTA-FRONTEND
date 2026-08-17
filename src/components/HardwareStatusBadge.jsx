import React from "react";

// Estado del hardware del sensor (¿sigue mandando datos?), distinto del
// StatusBadge que muestra el nivel del río medido por ese sensor.
function HardwareStatusBadge({ activo, enLinea }) {
  const estado = !activo
    ? { text: "Inactivo", color: "var(--color-text-muted)", bg: "var(--color-surface-alt)" }
    : enLinea
    ? { text: "En línea", color: "var(--color-normal)", bg: "var(--color-normal-soft)" }
    : { text: "Sin señal", color: "var(--color-alerta)", bg: "var(--color-alerta-soft)" };

  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-xs"
      style={{ color: estado.color, backgroundColor: estado.bg }}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: estado.color }} />
      {estado.text}
    </span>
  );
}

export default HardwareStatusBadge;
