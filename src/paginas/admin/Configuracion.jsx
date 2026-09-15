import { useState } from "react";
import { useConfiguracion } from "../../ganchos/useConfiguracion";
import { actualizarConfiguracion } from "../../utilidades/api";
import AdminPageHeader from "../../componentes/admin/AdminPageHeader";
import RequiereRol from "../../componentes/admin/RequiereRol";
import Skeleton from "../../componentes/Skeleton";
import ErrorBanner from "../../componentes/ErrorBanner";
import Icon from "../../componentes/Icon";
import { ROLES_ADMINISTRADOR } from "../../constantes/roles";

const CANALES = [
  {
    campo: "sms_habilitado",
    titulo: "Alertas por SMS",
    descripcion: "Aviso automático por SMS (Twilio) cuando cambia el estado del río.",
  },
  {
    campo: "email_habilitado",
    titulo: "Correos de vencimiento de póliza",
    descripcion:
      "Aviso por correo (Brevo) cuando una póliza está por vencer. No afecta la recuperación de contraseña.",
  },
  {
    campo: "push_habilitado",
    titulo: "Notificaciones push",
    descripcion: "Aviso automático push en el navegador cuando cambia el estado del río.",
  },
  {
    campo: "telegram_habilitado",
    titulo: "Bot de Telegram",
    descripcion:
      "Aviso automático por Telegram cuando cambia el estado del río. No afecta la difusión manual de Defensa Civil.",
  },
];

function Interruptor({ activo, disabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      disabled={disabled}
      onClick={() => onChange(!activo)}
      className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition disabled:opacity-50"
      style={{ backgroundColor: activo ? "var(--color-normal)" : "var(--color-border)" }}
    >
      <span
        className="inline-block h-5 w-5 transform rounded-full bg-white transition"
        style={{ transform: activo ? "translateX(22px)" : "translateX(4px)" }}
      />
    </button>
  );
}

function FilaCanal({ canal, valor, onCambiar }) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  async function manejarCambio(nuevoValor) {
    setGuardando(true);
    setError(null);
    try {
      await onCambiar(canal.campo, nuevoValor);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      className="flex items-center justify-between gap-4 rounded-2xl border p-5"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="min-w-0">
        <p className="font-semibold">{canal.titulo}</p>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          {canal.descripcion}
        </p>
        {error && (
          <p className="text-xs mt-1" style={{ color: "var(--color-alerta)" }}>
            {error}
          </p>
        )}
      </div>
      <Interruptor activo={valor} disabled={guardando} onChange={manejarCambio} />
    </div>
  );
}

function Configuracion() {
  const { data: config, loading, error, setData, recargar } = useConfiguracion();
  const [radioLocal, setRadioLocal] = useState(null);
  const [radioGuardando, setRadioGuardando] = useState(false);
  const [radioError, setRadioError] = useState(null);

  const radioValor = radioLocal ?? config?.radio_notificacion_push_km ?? "";

  async function cambiarCampo(campo, valor) {
    const actualizada = await actualizarConfiguracion({ [campo]: valor });
    setData(actualizada);
  }

  async function guardarRadio() {
    const numero = Number(radioLocal);
    if (!Number.isFinite(numero) || numero <= 0) {
      setRadioError("Ingresa un número mayor que 0");
      return;
    }
    setRadioGuardando(true);
    setRadioError(null);
    try {
      const actualizada = await actualizarConfiguracion({ radio_notificacion_push_km: numero });
      setData(actualizada);
      setRadioLocal(null);
    } catch (err) {
      setRadioError(err.message);
    } finally {
      setRadioGuardando(false);
    }
  }

  return (
    <RequiereRol roles={ROLES_ADMINISTRADOR}>
      <AdminPageHeader titulo="CONFIGURACIÓN" subtitulo="NOTIFICACIONES DEL SISTEMA" />

      <div className="p-4 sm:p-8 max-w-2xl">
        {error && (
          <div className="mb-6">
            <ErrorBanner message={`No se pudo cargar la configuración: ${error}`} onRetry={recargar} />
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          config && (
            <>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                Estos interruptores cortan un canal completo para todo el sistema (útil, por ejemplo, si se
                agota el saldo de Twilio) — no reemplazan el opt-in de cada usuario, se suman a él.
              </p>

              <div className="space-y-4 mb-6">
                {CANALES.map((canal) => (
                  <FilaCanal
                    key={canal.campo}
                    canal={canal}
                    valor={config[canal.campo]}
                    onCambiar={cambiarCampo}
                  />
                ))}
              </div>

              <div
                className="rounded-2xl border p-5"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <p className="font-semibold">Radio de notificación push geolocalizada</p>
                <p className="text-sm mt-1 mb-4" style={{ color: "var(--color-text-muted)" }}>
                  Cuando el río entra en prealerta o alerta roja cerca de una zona de riesgo, solo se notifica
                  a los suscriptores push con ubicación guardada dentro de este radio desde el borde de esa
                  zona.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={radioValor}
                    onChange={(e) => setRadioLocal(e.target.value)}
                    disabled={radioGuardando}
                    className="w-28 rounded-lg border px-3 py-2 text-sm font-mono-data disabled:opacity-50"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text)",
                    }}
                  />
                  <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    km
                  </span>
                  <button
                    type="button"
                    onClick={guardarRadio}
                    disabled={radioGuardando || radioLocal === null}
                    className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    <Icon name="bi-check-lg" aria-hidden="true" /> Guardar
                  </button>
                </div>
                {radioError && (
                  <p className="text-xs mt-2" style={{ color: "var(--color-alerta)" }}>
                    {radioError}
                  </p>
                )}
              </div>
            </>
          )
        )}
      </div>
    </RequiereRol>
  );
}

export default Configuracion;
