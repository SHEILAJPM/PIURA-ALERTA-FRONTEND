import React, { useMemo } from "react";

const ANCHO = 600;
const ALTO = 200;
const PADDING = 24;

function LevelChart({ puntos, umbrales }) {
  const { pathLinea, pathArea, minY, maxY, ultimo } = useMemo(() => {
    if (!puntos || puntos.length < 2) return {};

    const niveles = puntos.map((p) => Number(p.nivel_cm));
    const techoUmbral = umbrales?.alertaRoja ? Number(umbrales.alertaRoja) : Math.max(...niveles);
    const maxY = Math.max(...niveles, techoUmbral) * 1.05;
    const minY = Math.min(...niveles, 0) * 0.95;

    const escalarX = (i) => PADDING + (i / (puntos.length - 1)) * (ANCHO - PADDING * 2);
    const escalarY = (v) =>
      ALTO - PADDING - ((v - minY) / (maxY - minY || 1)) * (ALTO - PADDING * 2);

    const coords = niveles.map((v, i) => [escalarX(i), escalarY(v)]);
    const pathLinea = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
    const ultimaX = coords[coords.length - 1][0];
    const primeraX = coords[0][0];
    const pathArea = `${pathLinea} L${ultimaX},${ALTO - PADDING} L${primeraX},${ALTO - PADDING} Z`;

    return { pathLinea, pathArea, minY, maxY, ultimo: coords[coords.length - 1] };
  }, [puntos, umbrales]);

  if (!puntos || puntos.length < 2) {
    return (
      <div
        className="h-48 flex items-center justify-center text-sm text-center px-4"
        style={{ color: "var(--color-text-muted)" }}
      >
        Aún no hay suficientes lecturas recientes para graficar la tendencia.
      </div>
    );
  }

  const escalarYUmbral = (v) =>
    ALTO - PADDING - ((v - minY) / (maxY - minY || 1)) * (ALTO - PADDING * 2);

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="w-full h-48">
      <defs>
        <linearGradient id="areaNivel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {umbrales?.prealerta && (
        <line
          x1={PADDING}
          x2={ANCHO - PADDING}
          y1={escalarYUmbral(umbrales.prealerta)}
          y2={escalarYUmbral(umbrales.prealerta)}
          stroke="var(--color-prealerta)"
          strokeDasharray="4 4"
          strokeWidth="1"
        />
      )}

      {umbrales?.alertaRoja && (
        <line
          x1={PADDING}
          x2={ANCHO - PADDING}
          y1={escalarYUmbral(umbrales.alertaRoja)}
          y2={escalarYUmbral(umbrales.alertaRoja)}
          stroke="var(--color-alerta)"
          strokeDasharray="4 4"
          strokeWidth="1"
        />
      )}

      <path d={pathArea} fill="url(#areaNivel)" />
      <path
        d={pathLinea}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {ultimo && <circle cx={ultimo[0]} cy={ultimo[1]} r="4" fill="var(--color-primary)" />}
    </svg>
  );
}

export default LevelChart;
