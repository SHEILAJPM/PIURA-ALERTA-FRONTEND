import React from "react";
import StatusBadge from "./StatusBadge";
import Skeleton from "./Skeleton";
import ErrorBanner from "./ErrorBanner";
import { useUltimaLectura } from "../hooks/useUltimaLectura";

function formatearHora(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function RiverStatus() {
  const { lectura, loading, error, recargar } = useUltimaLectura();

  if (loading) {
    return (
      <section
        className="rounded-3xl border p-6"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <Skeleton className="h-4 w-56 mb-4" />
        <Skeleton className="h-10 w-40 mb-3" />
        <Skeleton className="h-4 w-32" />
      </section>
    );
  }

  if (error) {
    return (
      <ErrorBanner
        message={`No se pudo conectar con el backend (${error}). Verifica que el servidor esté corriendo en ${
          import.meta.env.VITE_API_URL
        }.`}
        onRetry={recargar}
      />
    );
  }

  const prediccion = lectura?.prediccion;

  return (
    <section
      className="rounded-3xl border p-6"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
            ESTADO ACTUAL DEL RÍO PIURA
          </p>
          <h2 className="font-mono-data text-4xl font-bold mt-2">{lectura.nivel_cm} cm</h2>
          <p className="mt-1" style={{ color: "var(--color-text-muted)" }}>
            {lectura.porcentaje}% del umbral de alerta roja
          </p>
        </div>

        <StatusBadge status={lectura.estado} />
      </div>

      <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm">
          <span style={{ color: "var(--color-text-muted)" }}>Última lectura</span>
          <span className="font-semibold font-mono-data">{formatearHora(lectura.medido_en)}</span>
        </div>

        {prediccion?.disponible && (
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm mt-2">
            <span style={{ color: "var(--color-text-muted)" }}>Proyección si sigue subiendo</span>
            <span className="font-semibold" style={{ color: "var(--color-prealerta)" }}>
              Alerta roja en ~{prediccion.minutosParaAlerta} min
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

export default RiverStatus;
