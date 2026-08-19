import ReportForm from "../components/ReportForm";
import ReportCard from "../components/ReportCard";
import StoriesBar from "../components/StoriesBar";
import RiesgoMap from "../components/RiesgoMap";
import CalculadoraSacos from "../components/CalculadoraSacos";
import Skeleton from "../components/Skeleton";
import ErrorBanner from "../components/ErrorBanner";
import { useReportes } from "../hooks/useReportes";
import { useAuth } from "../context/AuthContext";

function Reportes() {
  const { reportes, loading, error, enviando, enviarReporte, darLike, cargarMas, cargandoMas, hayMas } =
    useReportes();
  const { usuario, abrirModal } = useAuth();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-6">
        <p
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: "var(--color-primary)" }}
        >
          Portal ciudadano
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">Reportes y mapa de riesgo en vivo</h2>
        <p className="mt-3 max-w-2xl" style={{ color: "var(--color-text-muted)" }}>
          Comparte lo que ves en tu zona, revisa lo que reporta la comunidad y ubica el albergue y la ruta más
          seguros. No necesitas cuenta para reportar.
        </p>
        {!usuario && (
          <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
            ¿Quieres que tu nombre quede fijo en tus reportes y poder dar like?{" "}
            <button
              type="button"
              onClick={() => abrirModal("login")}
              className="font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              Inicia sesión
            </button>
          </p>
        )}
      </section>

      <StoriesBar />

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
        <div className="space-y-4">
          <ReportForm onEnviar={enviarReporte} enviando={enviando} />

          {error && <ErrorBanner message={`No se pudieron cargar los reportes: ${error}`} />}

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
          ) : reportes.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Aún no hay reportes ciudadanos. Sé el primero en compartir uno.
            </p>
          ) : (
            <>
              {reportes.map((reporte) => (
                <ReportCard key={reporte.id} reporte={reporte} onLike={darLike} />
              ))}
              {hayMas && (
                <button
                  type="button"
                  onClick={cargarMas}
                  disabled={cargandoMas}
                  className="w-full text-sm font-semibold py-2.5 rounded-xl border disabled:opacity-50"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-primary)" }}
                >
                  {cargandoMas ? "Cargando..." : "Cargar más reportes"}
                </button>
              )}
            </>
          )}
        </div>

        <div className="space-y-4">
          <RiesgoMap altura="420px" />
          <CalculadoraSacos />
        </div>
      </div>
    </main>
  );
}

export default Reportes;
