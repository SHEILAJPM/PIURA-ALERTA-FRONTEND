import React from "react";
import ReportForm from "../components/ReportForm";
import ReportCard from "../components/ReportCard";
import StoriesBar from "../components/StoriesBar";
import Skeleton from "../components/Skeleton";
import ErrorBanner from "../components/ErrorBanner";
import { useReportes } from "../hooks/useReportes";
import { useAuth } from "../context/AuthContext";

function Reportes() {
  const { reportes, loading, error, enviando, enviarReporte, darLike } = useReportes();
  const { usuario, abrirModal } = useAuth();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-6">
        <p
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: "var(--color-primary)" }}
        >
          Comunidad
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">Reportes ciudadanos</h2>
        <p className="mt-3 max-w-2xl" style={{ color: "var(--color-text-muted)" }}>
          Comparte lo que ves en tu zona: acumulación de agua, cauces bloqueados o cualquier riesgo
          para la comunidad. No necesitas cuenta para reportar.
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

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <ReportForm onEnviar={enviarReporte} enviando={enviando} />

        <div className="space-y-4">
          {error && <ErrorBanner message={`No se pudieron cargar los reportes: ${error}`} />}

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))
          ) : reportes.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Aún no hay reportes ciudadanos. Sé el primero en compartir uno.
            </p>
          ) : (
            reportes.map((reporte) => (
              <ReportCard key={reporte.id} reporte={reporte} onLike={darLike} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default Reportes;
