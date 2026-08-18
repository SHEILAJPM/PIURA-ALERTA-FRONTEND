import React, { useState } from "react";
import { useUltimaLectura } from "../../hooks/useUltimaLectura";
import { useEstadoSensores } from "../../hooks/useEstadoSensores";
import { difundirAlertaManual } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import Skeleton from "../../components/Skeleton";
import ErrorBanner from "../../components/ErrorBanner";

const LIMITE_MENSAJE = 1000;

function DifusionManual() {
  const [mensaje, setMensaje] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviadoA, setEnviadoA] = useState(null);
  const [error, setError] = useState(null);

  async function confirmar() {
    setEnviando(true);
    setError(null);
    try {
      const resultado = await difundirAlertaManual(mensaje);
      setEnviadoA(resultado.enviado_a);
      setMensaje("");
      setConfirmando(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="rounded-2xl border p-6"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <i className="bi bi-megaphone" style={{ color: "var(--color-primary)" }} aria-hidden="true" />
        <h2 className="font-bold">Difusión manual a Telegram</h2>
      </div>
      <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
        Envía un aviso a todos los suscriptores activos, además de los avisos automáticos por cambio
        de nivel del río.
      </p>

      <textarea
        value={mensaje}
        onChange={(e) => {
          setMensaje(e.target.value);
          setEnviadoA(null);
        }}
        maxLength={LIMITE_MENSAJE}
        rows={4}
        placeholder="Ej. Evacúen preventivamente el sector Puente Bolognesi hacia el Coliseo Gerónimo Seminario."
        className="w-full rounded-lg border px-3 py-2 text-sm resize-none"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
      />
      <p className="text-xs mt-1 text-right" style={{ color: "var(--color-text-muted)" }}>
        {mensaje.length} / {LIMITE_MENSAJE}
      </p>

      {error && (
        <p className="text-sm mt-2" style={{ color: "var(--color-alerta)" }}>
          {error}
        </p>
      )}

      {enviadoA !== null && (
        <p className="text-sm mt-2 font-medium flex items-center gap-1.5" style={{ color: "var(--color-normal)" }}>
          <i className="bi bi-check-circle-fill" aria-hidden="true" /> Enviado a {enviadoA} suscriptor
          {enviadoA === 1 ? "" : "es"}.
        </p>
      )}

      {confirmando ? (
        <div
          className="mt-4 rounded-xl p-4"
          style={{ backgroundColor: "var(--color-alerta-soft)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--color-alerta)" }}>
            ¿Confirmar el envío a todos los suscriptores activos? No se puede deshacer.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={confirmar}
              disabled={enviando}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--color-alerta)" }}
            >
              {enviando ? "Enviando..." : "Sí, enviar ahora"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              disabled={enviando}
              className="text-sm font-medium px-4 py-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          disabled={mensaje.trim().length === 0}
          className="mt-4 text-sm font-semibold px-5 py-2.5 rounded-lg text-white disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Enviar difusión
        </button>
      )}
    </div>
  );
}

function Despacho() {
  const { lectura, loading, error } = useUltimaLectura();
  const { data: sensores } = useEstadoSensores();
  const enLinea = sensores?.filter((s) => s.en_linea).length ?? 0;
  const total = sensores?.length ?? 0;

  return (
    <>
      <AdminPageHeader titulo="CONSOLA DE DESPACHO" subtitulo="DEFENSA CIVIL / COER" />

      <div className="p-4 sm:p-8">
        {error && (
          <div className="mb-6">
            <ErrorBanner message={`No se pudo cargar el estado del río: ${error}`} />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <div
            className="rounded-2xl border p-5"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <p className="text-sm font-medium mb-3" style={{ color: "var(--color-text-muted)" }}>
              Estado actual del río
            </p>
            {loading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-bold font-mono-data">{lectura?.nivel_cm ?? "—"} cm</span>
                {lectura?.estado && <StatusBadge status={lectura.estado} />}
              </div>
            )}
          </div>

          <div
            className="rounded-2xl border p-5"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <p className="text-sm font-medium mb-3" style={{ color: "var(--color-text-muted)" }}>
              Nodos en línea
            </p>
            <p className="text-3xl font-bold font-mono-data">
              {enLinea}
              <span className="text-lg font-normal" style={{ color: "var(--color-text-muted)" }}>
                /{total}
              </span>
            </p>
          </div>
        </div>

        <DifusionManual />
      </div>
    </>
  );
}

export default Despacho;
