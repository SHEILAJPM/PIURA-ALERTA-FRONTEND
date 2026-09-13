import { useImpacto } from "../../ganchos/useImpacto";
import AdminPageHeader from "../../componentes/admin/AdminPageHeader";
import RequiereRol from "../../componentes/admin/RequiereRol";
import Skeleton from "../../componentes/Skeleton";
import ErrorBanner from "../../componentes/ErrorBanner";
import { ROLES_ADMINISTRADOR } from "../../constantes/roles";

const ROL_LABEL = {
  ciudadano: "Ciudadanos",
  operario: "Operarios",
  defensa_civil: "Defensa Civil",
  administrador: "Administradores",
};

const ESTADO_LABEL = {
  pendiente: "Pendientes",
  verificado: "Verificados",
  descartado: "Descartados",
};

function StatCard({ valor, etiqueta, color = "var(--color-text)" }) {
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

function Desglose({ titulo, datos, labels }) {
  const entradas = Object.entries(datos ?? {});
  if (entradas.length === 0) return null;
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <h3 className="font-semibold text-sm mb-3">{titulo}</h3>
      <ul className="space-y-2">
        {entradas.map(([clave, cantidad]) => (
          <li key={clave} className="flex items-center justify-between text-sm">
            <span style={{ color: "var(--color-text-muted)" }}>{labels?.[clave] ?? clave}</span>
            <span className="font-mono-data font-semibold">{cantidad}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Impacto() {
  const { data: impacto, loading, error, recargar } = useImpacto();

  return (
    <RequiereRol roles={ROLES_ADMINISTRADOR}>
      <AdminPageHeader
        titulo="PANEL DE IMPACTO"
        subtitulo="RESUMEN PARA DEFENSA CIVIL Y LA MUNICIPALIDAD"
      />

      <div className="p-4 sm:p-8">
        {error && (
          <div className="mb-6">
            <ErrorBanner message={`No se pudo cargar el panel de impacto: ${error}`} onRetry={recargar} />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          impacto && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                  valor={impacto.usuarios_totales}
                  etiqueta="Usuarios registrados"
                  color="var(--color-primary)"
                />
                <StatCard valor={impacto.suscriptores_telegram} etiqueta="Suscritos a Telegram" />
                <StatCard valor={impacto.suscriptores_push} etiqueta="Suscritos a notificaciones push" />
                <StatCard
                  valor={impacto.alertas_automaticas_enviadas}
                  etiqueta="Alertas automáticas enviadas"
                  color="var(--color-alerta)"
                />
                <StatCard valor={impacto.reportes_totales} etiqueta="Reportes ciudadanos" />
                <StatCard
                  valor={impacto.polizas_vigentes}
                  etiqueta="Pólizas de seguro vigentes"
                  color="var(--color-dorado)"
                />
                <StatCard
                  valor={impacto.chequeos_seguridad_ultimas_24h}
                  etiqueta="Ciudadanos a salvo (últimas 24h)"
                  color="var(--color-normal)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Desglose
                  titulo="Usuarios por rol"
                  datos={impacto.usuarios_por_rol}
                  labels={ROL_LABEL}
                />
                <Desglose
                  titulo="Reportes por estado"
                  datos={impacto.reportes_por_estado}
                  labels={ESTADO_LABEL}
                />
              </div>
            </>
          )
        )}
      </div>
    </RequiereRol>
  );
}

export default Impacto;
