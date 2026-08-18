import React from "react";
import { useAuditoria } from "../../hooks/useAuditoria";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import RequiereRol from "../../components/admin/RequiereRol";
import Skeleton from "../../components/Skeleton";
import ErrorBanner from "../../components/ErrorBanner";
import { ROLES_ADMINISTRADOR } from "../../constants/roles";

const ACCION_LABEL = {
  cambiar_rol: "Cambio de rol",
  actualizar_ticket: "Ticket actualizado",
  crear_ticket: "Ticket creado",
  calibrar_sensor: "Calibración de sensor",
  difusion_manual: "Difusión manual",
};

function formatearFecha(iso) {
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Auditoria() {
  const { data: acciones, loading, error, recargar } = useAuditoria(100);

  return (
    <RequiereRol roles={ROLES_ADMINISTRADOR}>
      <AdminPageHeader titulo="AUDITORÍA" subtitulo="REGISTRO DE ACCIONES" />

      <div className="p-4 sm:p-8">
        {error && (
          <div className="mb-6">
            <ErrorBanner message={`No se pudo cargar el registro: ${error}`} onRetry={recargar} />
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : !acciones || acciones.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>
            Todavía no hay acciones registradas. Cada cambio de rol, moderación, aforo, calibración o
            difusión manual queda aquí desde ahora.
          </p>
        ) : (
          <div
            className="rounded-2xl border divide-y overflow-hidden"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            {acciones.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-4 px-5 py-3 text-sm" style={{ borderColor: "var(--color-border)" }}>
                <div className="min-w-0">
                  <p>
                    <span className="font-semibold">{a.usuario_nombre}</span>{" "}
                    <span style={{ color: "var(--color-text-muted)" }}>
                      {(ACCION_LABEL[a.accion] ?? a.accion).toLowerCase()}
                    </span>
                  </p>
                  {a.detalle && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>
                      {a.detalle}
                    </p>
                  )}
                </div>
                <span className="text-xs font-mono-data shrink-0" style={{ color: "var(--color-text-muted)" }}>
                  {formatearFecha(a.creado_en)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequiereRol>
  );
}

export default Auditoria;
