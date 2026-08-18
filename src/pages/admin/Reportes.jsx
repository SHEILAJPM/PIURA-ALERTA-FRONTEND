import React, { useState } from "react";
import { useReportes } from "../../hooks/useReportes";
import Skeleton from "../../components/Skeleton";
import ErrorBanner from "../../components/ErrorBanner";
import AdminPageHeader from "../../components/admin/AdminPageHeader";

const ESTADO_LABEL = {
  pendiente: { text: "Pendiente de revisión", color: "var(--color-prealerta)", bg: "var(--color-prealerta-soft)" },
  verificado: { text: "Verificado", color: "var(--color-normal)", bg: "var(--color-normal-soft)" },
  descartado: { text: "Descartado", color: "var(--color-text-muted)", bg: "var(--color-surface-alt)" },
};

function formatearFecha(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({ valor, etiqueta, color }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <p className="font-mono-data text-3xl font-bold" style={{ color }}>
        {valor}
      </p>
      <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
        {etiqueta}
      </p>
    </div>
  );
}

function DonutEstados({ pendientes, verificados, descartados }) {
  const total = pendientes + verificados + descartados;
  const segmentos = [
    { label: "Pendientes", valor: pendientes, color: "var(--color-prealerta)" },
    { label: "Verificados", valor: verificados, color: "var(--color-normal)" },
    { label: "Descartados", valor: descartados, color: "var(--color-text-muted)" },
  ];

  if (total === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        Todavía no hay reportes para graficar.
      </p>
    );
  }

  let acumulado = 0;
  const stops = segmentos
    .map((s) => {
      const inicio = (acumulado / total) * 360;
      acumulado += s.valor;
      const fin = (acumulado / total) * 360;
      return `${s.color} ${inicio}deg ${fin}deg`;
    })
    .join(", ");

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div
        className="w-32 h-32 rounded-full shrink-0"
        style={{
          background: `conic-gradient(${stops})`,
          WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 22px), #000 calc(100% - 22px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 22px), #000 calc(100% - 22px))",
        }}
      />
      <ul className="space-y-2 text-sm">
        {segmentos.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span style={{ color: "var(--color-text-muted)" }}>{s.label}</span>
            <span className="font-semibold">{s.valor}</span>
            <span style={{ color: "var(--color-text-muted)" }}>
              ({Math.round((s.valor / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReporteModeracion({ reporte, procesando, onVerificar, onDescartar }) {
  const estado = ESTADO_LABEL[reporte.estado] ?? ESTADO_LABEL.pendiente;

  return (
    <article
      className="rounded-2xl border p-5"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{reporte.usuario_nombre}</p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {formatearFecha(reporte.creado_en)}
          </p>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full shrink-0"
          style={{ color: estado.color, backgroundColor: estado.bg }}
        >
          {estado.text}
        </span>
      </div>

      {reporte.posible_spam === true && (
        <p
          className="mt-2 text-xs font-medium rounded-lg px-3 py-1.5 inline-block"
          style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-text-muted)" }}
          title={reporte.motivo_ia ?? undefined}
        >
          <i className="bi bi-robot" aria-hidden="true" /> Posible spam
          {reporte.motivo_ia ? `: ${reporte.motivo_ia}` : ""} — revisa igual, la IA puede equivocarse
        </p>
      )}

      <p className="mt-3 text-sm" style={{ color: "var(--color-text)" }}>
        {reporte.descripcion}
      </p>

      {reporte.foto_url && (
        <img
          src={reporte.foto_url}
          alt="Foto del reporte"
          className="mt-3 rounded-xl max-h-64 w-full object-cover"
        />
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onVerificar}
          disabled={procesando || reporte.estado === "verificado"}
          className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
          style={{ backgroundColor: "var(--color-normal)" }}
        >
          <i className="bi bi-check-lg" aria-hidden="true" /> Verificar
        </button>
        <button
          type="button"
          onClick={onDescartar}
          disabled={procesando || reporte.estado === "descartado"}
          className="text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
          style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-text)" }}
        >
          <i className="bi bi-x-lg" aria-hidden="true" /> Descartar
        </button>
      </div>
    </article>
  );
}

function ModeracionReportes() {
  const { reportes, loading, error, actualizarEstado } = useReportes(50);
  const [procesandoId, setProcesandoId] = useState(null);

  // Los marcados como posible spam se quedan al final (no se ocultan: la IA
  // puede equivocarse), así los reportes probablemente reales aparecen primero.
  const pendientes = reportes
    .filter((r) => r.estado === "pendiente")
    .sort((a, b) => (a.posible_spam === true ? 1 : 0) - (b.posible_spam === true ? 1 : 0));
  const revisados = reportes.filter((r) => r.estado !== "pendiente");
  const verificados = reportes.filter((r) => r.estado === "verificado").length;
  const descartados = reportes.filter((r) => r.estado === "descartado").length;

  async function cambiarEstado(id, estado) {
    setProcesandoId(id);
    try {
      await actualizarEstado(id, estado);
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <>
      <AdminPageHeader titulo="MODERACIÓN" subtitulo="DE REPORTES" />

      <div className="p-4 sm:p-8">
        {error && (
          <div className="mb-6">
            <ErrorBanner message={`No se pudieron cargar los reportes: ${error}`} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1.4fr] gap-4 mb-8">
          <StatCard valor={pendientes.length} etiqueta="Pendientes" color="var(--color-prealerta)" />
          <StatCard valor={verificados} etiqueta="Verificados" color="var(--color-normal)" />
          <StatCard valor={descartados} etiqueta="Descartados" color="var(--color-text-muted)" />
          <div
            className="rounded-2xl border p-5"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <p className="text-sm font-semibold mb-3">Distribución por estado</p>
            <DonutEstados pendientes={pendientes.length} verificados={verificados} descartados={descartados} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <h3 className="font-bold mb-3">Pendientes ({pendientes.length})</h3>
            {pendientes.length === 0 ? (
              <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
                No hay reportes pendientes de revisión.
              </p>
            ) : (
              <div className="space-y-4 mb-8">
                {pendientes.map((reporte) => (
                  <ReporteModeracion
                    key={reporte.id}
                    reporte={reporte}
                    procesando={procesandoId === reporte.id}
                    onVerificar={() => cambiarEstado(reporte.id, "verificado")}
                    onDescartar={() => cambiarEstado(reporte.id, "descartado")}
                  />
                ))}
              </div>
            )}

            <h3 className="font-bold mb-3">Ya revisados</h3>
            {revisados.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Aún no hay reportes revisados.
              </p>
            ) : (
              <div className="space-y-4">
                {revisados.map((reporte) => (
                  <ReporteModeracion
                    key={reporte.id}
                    reporte={reporte}
                    procesando={procesandoId === reporte.id}
                    onVerificar={() => cambiarEstado(reporte.id, "verificado")}
                    onDescartar={() => cambiarEstado(reporte.id, "descartado")}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default ModeracionReportes;
