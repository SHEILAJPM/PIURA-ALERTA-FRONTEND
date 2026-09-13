import { useState } from "react";
import { useAuth } from "../contexto/AuthContext";
import { useResource } from "../ganchos/useResource";
import { getPlanesSeguro, crearCheckoutSeguro } from "../utilidades/api";
import Skeleton from "../componentes/Skeleton";
import ErrorBanner from "../componentes/ErrorBanner";

const NOMBRE_PERIODO = { 1: "1 mes", 3: "3 meses", 6: "6 meses", 12: "1 año" };

function formatearPrecio(centavos) {
  return `S/ ${(centavos / 100).toFixed(2)}`;
}

function TarjetaPlan({ plan, destacado, procesando, onContratar }) {
  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-4"
      style={{
        borderColor: destacado ? "var(--color-primary)" : "var(--color-border)",
        backgroundColor: "var(--color-surface)",
        boxShadow: destacado ? "0 0 0 2px var(--color-primary)" : undefined,
      }}
    >
      {destacado && (
        <span
          className="self-start text-xs font-bold px-2 py-1 rounded-full text-white"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Más ahorro
        </span>
      )}
      <div>
        <p className="font-bold text-lg">{NOMBRE_PERIODO[plan.meses]}</p>
        <p className="text-3xl font-extrabold mt-1">{formatearPrecio(plan.precio_centavos)}</p>
        {plan.descuento > 0 && (
          <p className="text-sm mt-1" style={{ color: "var(--color-normal)" }}>
            {Math.round(plan.descuento * 100)}% de descuento vs. pagar mes a mes
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={procesando}
        onClick={() => onContratar(plan.meses)}
        className="mt-auto rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {procesando ? "Redirigiendo..." : "Contratar"}
      </button>
    </div>
  );
}

function Seguro() {
  const { usuario, abrirModal } = useAuth();
  const { data: planes, loading, error, recargar } = useResource(getPlanesSeguro, []);
  const [mesesProcesando, setMesesProcesando] = useState(null);
  const [errorPago, setErrorPago] = useState(null);

  async function manejarContratar(meses) {
    if (!usuario) {
      abrirModal("login");
      return;
    }
    setErrorPago(null);
    setMesesProcesando(meses);
    try {
      const { url } = await crearCheckoutSeguro(meses);
      window.location.href = url;
    } catch (err) {
      setErrorPago(err.message);
      setMesesProcesando(null);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-8">
        <p
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: "var(--color-primary)" }}
        >
          Seguro Piura Alerta
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">Cobertura contra inundaciones</h2>
        <p className="mt-3 max-w-2xl" style={{ color: "var(--color-text-muted)" }}>
          Paga por adelantado el periodo que prefieras. Mientras tu póliza esté vigente, quedas cubierto
          ante una crecida del río sin trámites ni papeleo — el mismo sistema que ya monitorea el nivel del
          agua es el que respalda la cobertura.
        </p>
      </section>

      {error && <ErrorBanner message={`No se pudieron cargar los planes: ${error}`} onRetry={recargar} />}
      {errorPago && (
        <div className="mb-4">
          <ErrorBanner message={`No se pudo iniciar el pago: ${errorPago}`} />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : (
        planes && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {planes.map((plan) => (
              <TarjetaPlan
                key={plan.meses}
                plan={plan}
                destacado={plan.meses === 12}
                procesando={mesesProcesando === plan.meses}
                onContratar={manejarContratar}
              />
            ))}
          </div>
        )
      )}

      <p className="text-xs mt-8" style={{ color: "var(--color-text-muted)" }}>
        Pago procesado por Stripe. Piura Alerta nunca ve ni guarda los datos de tu tarjeta.
      </p>
    </main>
  );
}

export default Seguro;
