import React from "react";
import RiverStatus from "../components/RiverStatus";
import KpiCard, { KpiCardSkeleton } from "../components/KpiCard";
import AlertCard from "../components/AlertCard";
import LevelChart from "../components/LevelChart";
import Skeleton from "../components/Skeleton";
import { useUltimaLectura } from "../hooks/useUltimaLectura";
import { useSensores } from "../hooks/useSensores";
import { useHistorico } from "../hooks/useHistorico";
import { recommendations } from "../data/content";

const SENSOR_POR_DEFECTO = "RIO-PIURA-01";

function formatearHora(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function calcularTendencia(prediccion) {
  if (!prediccion) return "—";
  if (prediccion.disponible) return "↑ Subiendo";
  if (typeof prediccion.pendienteCmPorMin === "number" && prediccion.pendienteCmPorMin < -0.05) {
    return "↓ Bajando";
  }
  return "↔ Estable";
}

function Home() {
  const { lectura, loading: cargandoLectura } = useUltimaLectura(SENSOR_POR_DEFECTO);
  const { data: sensores, loading: cargandoSensores } = useSensores();
  const {
    puntos,
    loading: cargandoHistorico,
    error: errorHistorico,
  } = useHistorico(SENSOR_POR_DEFECTO, 180);

  const sensorActivo = sensores?.find((s) => s.codigo === SENSOR_POR_DEFECTO) ?? sensores?.[0];
  const cargandoKpis = cargandoLectura || cargandoSensores;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-8">
        <p
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: "var(--color-primary)" }}
        >
          Sistema de prevención
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">Monitoreo del río Piura</h2>
        <p className="mt-3 max-w-2xl" style={{ color: "var(--color-text-muted)" }}>
          Consulta en tiempo real el estado del río, los niveles registrados por el sensor y las
          alertas activas durante periodos de lluvia.
        </p>
      </section>

      <RiverStatus />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {cargandoKpis ? (
          Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              title="Nivel del río"
              value={`${lectura?.nivel_cm ?? "—"} cm`}
              description="Registro actual"
              icon="🌊"
            />
            <KpiCard
              title="Tendencia"
              value={calcularTendencia(lectura?.prediccion)}
              description="Últimas mediciones"
              icon="📈"
            />
            <KpiCard
              title="Puntos activos"
              value={sensores?.filter((s) => s.activo).length ?? "—"}
              description="Sensores monitoreados"
              icon="📍"
            />
            <KpiCard
              title="Actualización"
              value={formatearHora(lectura?.medido_en)}
              description="Último registro"
              icon="🕐"
            />
          </>
        )}
      </section>

      <section
        className="mt-8 rounded-2xl border p-6"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <h2 className="text-xl font-bold">Tendencia del nivel (últimas 3 horas)</h2>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          Línea punteada: umbrales de prealerta y alerta roja del sensor.
        </p>
        <div className="mt-4">
          {cargandoHistorico ? (
            <Skeleton className="h-48 w-full" />
          ) : errorHistorico ? (
            <p className="text-sm" style={{ color: "var(--color-alerta)" }}>
              No se pudo cargar el histórico de lecturas.
            </p>
          ) : (
            <LevelChart
              puntos={puntos}
              umbrales={
                sensorActivo && {
                  prealerta: sensorActivo.nivel_prealerta_cm,
                  alertaRoja: sensorActivo.nivel_alerta_roja_cm,
                }
              }
            />
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Estado de alertas</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Información importante para la población
          </p>
        </div>
        <AlertCard estado={lectura?.estado} />
      </section>

      <section
        className="mt-8 mb-10 rounded-2xl p-6 border"
        style={{ backgroundColor: "var(--color-prealerta-soft)", borderColor: "var(--color-prealerta)" }}
      >
        <h2 className="text-xl font-bold">⚠️ Recomendaciones ante lluvias</h2>
        <ul className="mt-4 space-y-3" style={{ color: "var(--color-text)" }}>
          {recommendations.map((recomendacion) => (
            <li key={recomendacion}>• {recomendacion}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default Home;
