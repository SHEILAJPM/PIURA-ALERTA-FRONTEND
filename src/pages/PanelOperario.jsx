import React from "react";
import { useEstadoSensores } from "../hooks/useEstadoSensores";
import HardwareStatusBadge from "../components/HardwareStatusBadge";
import Skeleton from "../components/Skeleton";
import ErrorBanner from "../components/ErrorBanner";

function formatearFecha(iso) {
  if (!iso) return "Sin lecturas todavía";
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function TarjetaSensor({ sensor }) {
  return (
    <article
      className="rounded-2xl border p-5"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{sensor.nombre}</p>
          <p className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
            {sensor.codigo}
          </p>
        </div>
        <HardwareStatusBadge activo={sensor.activo} enLinea={sensor.en_linea} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt style={{ color: "var(--color-text-muted)" }}>Última lectura</dt>
          <dd className="font-medium">{formatearFecha(sensor.ultima_lectura?.medido_en)}</dd>
        </div>
        <div>
          <dt style={{ color: "var(--color-text-muted)" }}>Nivel reportado</dt>
          <dd className="font-medium">
            {sensor.ultima_lectura ? `${sensor.ultima_lectura.nivel_cm} cm` : "—"}
          </dd>
        </div>
        <div>
          <dt style={{ color: "var(--color-text-muted)" }}>Umbral prealerta</dt>
          <dd className="font-medium">{sensor.nivel_prealerta_cm} cm</dd>
        </div>
        <div>
          <dt style={{ color: "var(--color-text-muted)" }}>Umbral alerta roja</dt>
          <dd className="font-medium">{sensor.nivel_alerta_roja_cm} cm</dd>
        </div>
      </dl>
    </article>
  );
}

function PanelOperario() {
  const { sensores, loading, error, recargar } = useEstadoSensores();
  const sinSenal = sensores?.filter((s) => s.activo && !s.en_linea).length ?? 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-6">
        <p
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: "var(--color-primary)" }}
        >
          Panel de operario
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">Estado de los sensores</h2>
        <p className="mt-3 max-w-2xl" style={{ color: "var(--color-text-muted)" }}>
          Revisa qué sensores siguen mandando datos y cuáles dejaron de reportar, para detectar
          fallas de hardware antes de que hagan falta durante una crecida.
        </p>
        {!loading && sinSenal > 0 && (
          <p className="mt-3 text-sm font-semibold" style={{ color: "var(--color-alerta)" }}>
            {sinSenal} sensor{sinSenal > 1 ? "es" : ""} activo{sinSenal > 1 ? "s" : ""} sin señal
          </p>
        )}
      </section>

      {error && <ErrorBanner message={`No se pudo cargar el estado de los sensores: ${error}`} onRetry={recargar} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))
          : sensores?.map((sensor) => <TarjetaSensor key={sensor.id} sensor={sensor} />)}
      </div>

      {!loading && sensores?.length === 0 && (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Todavía no hay sensores registrados.
        </p>
      )}
    </main>
  );
}

export default PanelOperario;
