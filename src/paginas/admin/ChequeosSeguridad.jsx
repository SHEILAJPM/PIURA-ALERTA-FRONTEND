import { useChequeosSeguridad } from "../../ganchos/useChequeosSeguridad";
import AdminPageHeader from "../../componentes/admin/AdminPageHeader";
import RequiereRol from "../../componentes/admin/RequiereRol";
import Skeleton from "../../componentes/Skeleton";
import ErrorBanner from "../../componentes/ErrorBanner";
import { ROLES_DEFENSA_CIVIL } from "../../constantes/roles";

function formatearFecha(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "Hace cuánto" en vez de solo la fecha: durante una emergencia, lo que
// importa a simple vista es qué tan viejo es el último aviso de cada
// ciudadano, no la hora exacta.
function horasDesde(iso) {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 3600000;
}

function EstadoChequeo({ ultimoChequeo }) {
  const horas = horasDesde(ultimoChequeo);
  if (!ultimoChequeo) {
    return (
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{ color: "var(--color-text-muted)", backgroundColor: "var(--color-surface-alt)" }}
      >
        Nunca avisó
      </span>
    );
  }
  const reciente = horas < 24;
  return (
    <span
      className="text-xs font-semibold px-3 py-1 rounded-full"
      style={
        reciente
          ? { color: "var(--color-normal)", backgroundColor: "var(--color-normal-soft)" }
          : { color: "var(--color-alerta)", backgroundColor: "var(--color-alerta-soft)" }
      }
    >
      {formatearFecha(ultimoChequeo)}
    </span>
  );
}

function ChequeosSeguridad() {
  const { data: ciudadanos, loading, error, recargar } = useChequeosSeguridad();

  return (
    <RequiereRol roles={ROLES_DEFENSA_CIVIL}>
      <AdminPageHeader
        titulo="CHEQUEOS DE SEGURIDAD"
        subtitulo="QUIÉN AVISÓ QUE ESTÁ A SALVO"
      />

      <div className="p-4 sm:p-8">
        {error && (
          <div className="mb-6">
            <ErrorBanner message={`No se pudo cargar la lista: ${error}`} onRetry={recargar} />
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : !ciudadanos || ciudadanos.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>Todavía no hay ciudadanos registrados.</p>
        ) : (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: "var(--color-border)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left"
                  style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-text-muted)" }}
                >
                  <th className="px-4 py-3 font-medium">Ciudadano</th>
                  <th className="px-4 py-3 font-medium">Teléfono</th>
                  <th className="px-4 py-3 font-medium">Último aviso</th>
                </tr>
              </thead>
              <tbody>
                {ciudadanos.map((c) => (
                  <tr key={c.usuario_id} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                    <td className="px-4 py-3 font-medium">{c.nombre}</td>
                    <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>
                      {c.telefono ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoChequeo ultimoChequeo={c.ultimo_chequeo} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequiereRol>
  );
}

export default ChequeosSeguridad;
