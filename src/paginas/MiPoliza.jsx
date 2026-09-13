import { Link, useSearchParams } from "react-router-dom";
import { useMiPoliza } from "../ganchos/useMiPoliza";
import Skeleton from "../componentes/Skeleton";
import ErrorBanner from "../componentes/ErrorBanner";

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
}

function MiPoliza() {
  const [parametros] = useSearchParams();
  const pagoExitoso = parametros.get("pago") === "exitoso";
  const { data, loading, error, recargar } = useMiPoliza();

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-6">
        <p
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: "var(--color-primary)" }}
        >
          Mi cuenta
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">Mi póliza</h2>
      </section>

      {pagoExitoso && (
        <p
          className="text-sm mb-4 rounded-xl border p-4"
          style={{ borderColor: "var(--color-normal)", color: "var(--color-normal)" }}
        >
          Pago recibido. Puede tardar unos segundos en reflejarse acá — si no aparece, recarga la página.
        </p>
      )}

      {error && <ErrorBanner message={`No se pudo cargar tu póliza: ${error}`} onRetry={recargar} />}

      {loading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : data?.poliza ? (
        <div
          className="rounded-2xl border p-6"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <span
            className="text-xs font-bold px-2 py-1 rounded-full text-white"
            style={{ backgroundColor: data.vigente ? "var(--color-normal)" : "var(--color-alerta)" }}
          >
            {data.vigente ? "Vigente" : "Vencida"}
          </span>
          <p className="mt-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Periodo contratado
          </p>
          <p className="font-semibold">
            {data.poliza.meses} {data.poliza.meses === 1 ? "mes" : "meses"} — S/{" "}
            {(data.poliza.precio_centavos / 100).toFixed(2)}
          </p>
          <p className="mt-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {data.vigente ? "Cubierto hasta" : "Venció el"}
          </p>
          <p className="font-semibold">{formatearFecha(data.poliza.fecha_fin)}</p>

          {!data.vigente && (
            <Link
              to="/seguro"
              className="inline-block mt-5 rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Renovar cobertura
            </Link>
          )}
        </div>
      ) : (
        <div
          className="rounded-2xl border p-6 text-center"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <p style={{ color: "var(--color-text-muted)" }}>Todavía no tienes una póliza contratada.</p>
          <Link
            to="/seguro"
            className="inline-block mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Ver planes
          </Link>
        </div>
      )}
    </main>
  );
}

export default MiPoliza;
