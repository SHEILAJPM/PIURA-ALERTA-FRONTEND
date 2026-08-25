import React, { useCallback, useState } from "react";
import { useReportes } from "../../hooks/useReportes";
import { useAuth } from "../../context/AuthContext";
import Skeleton from "../../components/Skeleton";
import ErrorBanner from "../../components/ErrorBanner";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import Icon from "../../components/Icon";
import { exportarReportesCSV, exportarReportesPDF } from "../../lib/exportarReportes";

const ESTADO_LABEL = {
  pendiente: {
    text: "Pendiente de revisión",
    color: "var(--color-prealerta)",
    bg: "var(--color-prealerta-soft)",
  },
  en_progreso: {
    text: "En progreso",
    color: "var(--color-primary)",
    bg: "var(--color-primary-soft)",
  },
  verificado: {
    text: "Verificado por Defensa Civil",
    color: "var(--color-normal)",
    bg: "var(--color-normal-soft)",
  },
  descartado: {
    text: "Descartado",
    color: "var(--color-text-muted)",
    bg: "var(--color-surface-alt)",
  },
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

function DonutEstados({ pendientes, enProgreso, verificados, descartados }) {
  const total = pendientes + enProgreso + verificados + descartados;
  const segmentos = [
    { label: "Pendientes", valor: pendientes, color: "var(--color-prealerta)" },
    { label: "En progreso", valor: enProgreso, color: "var(--color-primary)" },
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
    .filter((s) => s.valor > 0)
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
            <span style={{ color: "var(--color-text-muted)" }}>({Math.round((s.valor / total) * 100)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// COMPONENTE DE MODERACIÓN MEJORADO
const ReporteModeracion = React.memo(function ReporteModeracion({ reporte, procesando, onCambiarEstado }) {
  const estado = ESTADO_LABEL[reporte.estado] ?? ESTADO_LABEL.pendiente;

  return (
    <article
      className={`rounded-2xl border p-5 transition-all ${reporte.estado === 'pendiente' ? 'border-yellow-200 dark:border-yellow-800' : ''
        } ${reporte.estado === 'en_progreso' ? 'border-blue-200 dark:border-blue-800' : ''
        }`}
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={reporte.usuario_foto_url || `https://ui-avatars.com/api/?name=${reporte.usuario_nombre}&background=0a2f52&color=fff&size=32`}
            alt={`Foto de ${reporte.usuario_nombre}`}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="font-semibold">{reporte.usuario_nombre}</p>
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <span>{formatearFecha(reporte.creado_en)}</span>
              {reporte.ubicacion?.coordinates && (
                <span>· 📍 {reporte.ubicacion.coordinates[1].toFixed(4)}, {reporte.ubicacion.coordinates[0].toFixed(4)}</span>
              )}
            </div>
          </div>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full shrink-0"
          style={{ color: estado.color, backgroundColor: estado.bg }}
        >
          {estado.text}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Columna de Contenido */}
        <div className="md:col-span-2">
          <p className="text-sm" style={{ color: "var(--color-text)" }}>
            {reporte.descripcion}
          </p>
          <div className="flex gap-4 mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
            <span>👍 {reporte.reacciones_util || 0} útiles</span>
            <span>🚨 {reporte.reacciones_alerta || 0} alertas</span>
            <span>✅ {reporte.reacciones_confirmo || 0} confirman</span>
          </div>
        </div>

        {/* Columna de Imagen (si existe) */}
        {reporte.foto_url && (
          <div className="md:col-span-1">
            <img
              src={reporte.foto_url}
              alt="Foto del reporte"
              loading="lazy"
              className="rounded-xl max-h-48 w-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Etiqueta de Spam */}
      {reporte.posible_spam === true && (
        <p
          className="mt-3 text-xs font-medium rounded-lg px-3 py-1.5 inline-block"
          style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-text-muted)" }}
          title={reporte.motivo_ia ?? undefined}
        >
          <Icon name="bi-robot" aria-hidden="true" /> Posible spam
          {reporte.motivo_ia ? `: ${reporte.motivo_ia}` : ""} — revisa igual, la IA puede equivocarse
        </p>
      )}

      {/* Acciones de Moderación */}
      <div className="mt-4 flex gap-2 border-t pt-4 flex-wrap" style={{ borderColor: "var(--color-border)" }}>
        {reporte.estado === 'pendiente' && (
          <>
            <button
              type="button"
              onClick={() => onCambiarEstado(reporte.id, "verificado")}
              disabled={procesando}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--color-normal)" }}
            >
              <Icon name="bi-check-lg" aria-hidden="true" /> Verificar
            </button>
            <button
              type="button"
              onClick={() => onCambiarEstado(reporte.id, "en_progreso")}
              disabled={procesando}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <Icon name="bi-clock-history" aria-hidden="true" /> En Progreso
            </button>
            <button
              type="button"
              onClick={() => onCambiarEstado(reporte.id, "descartado")}
              disabled={procesando}
              className="text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
              style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-text)" }}
            >
              <Icon name="bi-x-lg" aria-hidden="true" /> Descartar
            </button>
          </>
        )}
        {reporte.estado === 'en_progreso' && (
          <>
            <button
              type="button"
              onClick={() => onCambiarEstado(reporte.id, "verificado")}
              disabled={procesando}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--color-normal)" }}
            >
              <Icon name="bi-check-lg" aria-hidden="true" /> Resolver
            </button>
            <button
              type="button"
              onClick={() => onCambiarEstado(reporte.id, "descartado")}
              disabled={procesando}
              className="text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
              style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-text)" }}
            >
              <Icon name="bi-x-lg" aria-hidden="true" /> Descartar
            </button>
          </>
        )}
        {reporte.estado === 'verificado' && (
          <span className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
            ✅ Este reporte ya fue verificado
          </span>
        )}
        {reporte.estado === 'descartado' && (
          <span className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
            🗑️ Este reporte fue descartado
          </span>
        )}
      </div>
    </article>
  );
});

function ModeracionReportes() {
  const { usuario } = useAuth();
  const { reportes, loading, error, actualizarEstado, reaccionarReporte } = useReportes(50);
  const [procesandoId, setProcesandoId] = useState(null);

  const esAdministrador = usuario?.rol === "administrador";

  const pendientes = reportes
    .filter((r) => r.estado === "pendiente")
    .sort((a, b) => (a.posible_spam === true ? 1 : 0) - (b.posible_spam === true ? 1 : 0));
  const enProgresoList = reportes.filter((r) => r.estado === "en_progreso");
  const verificadosList = reportes.filter((r) => r.estado === "verificado");
  const archivadosList = reportes.filter((r) => r.estado === "descartado");

  const enProgreso = enProgresoList.length;
  const verificados = verificadosList.length;
  const descartados = archivadosList.length;

  const cambiarEstado = useCallback(
    async (id, estado) => {
      setProcesandoId(id);
      try {
        await actualizarEstado(id, estado);
      } finally {
        setProcesandoId(null);
      }
    },
    [actualizarEstado]
  );

  return (
    <>
      <AdminPageHeader titulo="MODERACIÓN" subtitulo="DE REPORTES CIUDADANOS" />

      <div className="p-4 sm:p-8">
        {error && (
          <div className="mb-6">
            <ErrorBanner message={`No se pudieron cargar los reportes: ${error}`} />
          </div>
        )}

        {!loading && reportes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              type="button"
              onClick={() => exportarReportesCSV(reportes)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              <Icon name="bi-download" aria-hidden="true" /> Exportar CSV
            </button>
            <button
              type="button"
              onClick={() => exportarReportesPDF(reportes)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              <Icon name="bi-download" aria-hidden="true" /> Exportar PDF
            </button>
          </div>
        )}

        {esAdministrador ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_1.6fr] gap-4 mb-8">
            <StatCard valor={pendientes.length} etiqueta="Pendientes" color="var(--color-prealerta)" />
            <StatCard valor={enProgreso} etiqueta="En progreso" color="var(--color-primary)" />
            <StatCard valor={verificados} etiqueta="Verificados" color="var(--color-normal)" />
            <StatCard valor={descartados} etiqueta="Descartados" color="var(--color-text-muted)" />
            <div
              className="rounded-2xl border p-5"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <p className="text-sm font-semibold mb-3">Distribución por estado</p>
              <DonutEstados
                pendientes={pendientes.length}
                enProgreso={enProgreso}
                verificados={verificados}
                descartados={descartados}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <StatCard valor={pendientes.length} etiqueta="Pendientes" color="var(--color-prealerta)" />
            <StatCard valor={enProgreso} etiqueta="En progreso" color="var(--color-primary)" />
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* PENDIENTES */}
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
                    onCambiarEstado={cambiarEstado}
                  />
                ))}
              </div>
            )}

            {/* EN PROGRESO */}
            <h3 className="font-bold mb-3">En progreso ({enProgresoList.length})</h3>
            {enProgresoList.length === 0 ? (
              <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
                No hay reportes en progreso.
              </p>
            ) : (
              <div className="space-y-4 mb-8">
                {enProgresoList.map((reporte) => (
                  <ReporteModeracion
                    key={reporte.id}
                    reporte={reporte}
                    procesando={procesandoId === reporte.id}
                    onCambiarEstado={cambiarEstado}
                  />
                ))}
              </div>
            )}

            {/* VERIFICADOS - Solo para administradores */}
            {esAdministrador && (
              <>
                <h3 className="font-bold mb-3">Verificados ({verificadosList.length})</h3>
                {verificadosList.length === 0 ? (
                  <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
                    Aún no hay reportes verificados.
                  </p>
                ) : (
                  <div className="space-y-4 mb-8">
                    {verificadosList.map((reporte) => (
                      <ReporteModeracion
                        key={reporte.id}
                        reporte={reporte}
                        procesando={procesandoId === reporte.id}
                        onCambiarEstado={cambiarEstado}
                      />
                    ))}
                  </div>
                )}

                {/* DESCARTADOS - Solo para administradores */}
                <h3 className="font-bold mb-3">Descartados ({archivadosList.length})</h3>
                {archivadosList.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Todavía no se descartó ningún reporte.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {archivadosList.map((reporte) => (
                      <ReporteModeracion
                        key={reporte.id}
                        reporte={reporte}
                        procesando={procesandoId === reporte.id}
                        onCambiarEstado={cambiarEstado}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default ModeracionReportes;