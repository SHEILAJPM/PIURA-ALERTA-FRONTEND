import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import Icon from "./Icon";
import { formatearDistancia } from "../lib/geo";

const ESTADO_LABEL = {
  pendiente: { text: "Pendiente de revisión", color: "var(--color-prealerta)" },
  verificado: { text: "✅ Verificado por Defensa Civil", color: "var(--color-normal)" },
  en_progreso: { text: "🔄 En progreso", color: "var(--color-primary)" },
  descartado: { text: "Archivado por moderación", color: "var(--color-text-muted)" },
};

function formatearRelativo(iso) {
  const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return "ahora";
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `${dias} d`;
  const semanas = Math.floor(dias / 7);
  if (semanas < 5) return `${semanas} sem`;
  return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}

async function compartir(reporte) {
  const texto = `${reporte.usuario_nombre} en Piura Alerta: ${reporte.descripcion}`;
  if (navigator.share) {
    try {
      await navigator.share({ text: texto, url: window.location.href });
    } catch {
      // el usuario canceló el share sheet — no es un error a mostrar
    }
    return;
  }
  await navigator.clipboard?.writeText(`${texto} — ${window.location.href}`);
}

function ReportCard({ reporte, onReaccion, distanciaKm }) {
  const { usuario, abrirModal } = useAuth();
  const [enviandoReaccion, setEnviandoReaccion] = useState(false);
  const aviso = ESTADO_LABEL[reporte.estado];

  // Determinar qué reacción tiene el usuario actual
  const reaccionUsuario = reporte.reaccion_usuario || null;

  async function manejarReaccion(tipo) {
    if (!usuario) {
      abrirModal("login");
      return;
    }
    if (enviandoReaccion) return;

    // Si ya tiene esta reacción, la quita (toggle)
    const nuevaReaccion = reaccionUsuario === tipo ? null : tipo;

    setEnviandoReaccion(true);
    try {
      await onReaccion(reporte.id, nuevaReaccion);
    } finally {
      setEnviandoReaccion(false);
    }
  }

  // Obtener contadores de reacciones
  const contadorUtil = reporte.reacciones_util || 0;
  const contadorAlerta = reporte.reacciones_alerta || 0;
  const contadorConfirmo = reporte.reacciones_confirmo || 0;

  return (
    <article
      className={`rounded-2xl border overflow-hidden ${reporte.estado === "verificado" ? "border-green-400 dark:border-green-600" : ""
        } ${reporte.estado === "en_progreso" ? "border-blue-400 dark:border-blue-600" : ""
        }`}
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)"
      }}
    >
      <header className="flex items-center gap-3 px-4 py-3">
        <Avatar nombre={reporte.usuario_nombre} size={36} />
        <div className="min-w-0 leading-tight">
          <p className="font-semibold text-sm truncate">
            {reporte.usuario_nombre}
            <span className="font-normal" style={{ color: "var(--color-text-muted)" }}>
              {" "}
              · {formatearRelativo(reporte.creado_en)}
              {distanciaKm != null && <> · {formatearDistancia(distanciaKm)}</>}
            </span>
          </p>
          {aviso && (
            <p className="text-xs font-medium" style={{ color: aviso.color }}>
              {aviso.text}
            </p>
          )}
        </div>
      </header>

      {reporte.posible_spam === true && (
        <p
          className="mx-4 mb-3 text-xs font-medium rounded-lg px-3 py-1.5"
          style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-text-muted)" }}
          title={reporte.motivo_ia ?? undefined}
        >
          <Icon name="bi-robot" aria-hidden="true" /> Posible spam — revisa igual, la IA puede equivocarse
        </p>
      )}

      {reporte.foto_url ? (
        <img
          src={reporte.foto_url}
          alt={reporte.descripcion}
          loading="lazy"
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div
          className="w-full px-6 flex items-center justify-center text-center min-h-48"
          style={{ backgroundColor: "var(--color-primary-soft)" }}
        >
          <p className="text-lg font-semibold leading-snug" style={{ color: "var(--color-primary)" }}>
            “{reporte.descripcion}”
          </p>
        </div>
      )}

      {/* BARRA DE REACCIONES MEJORADA */}
      <div className="px-4 pt-3 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => manejarReaccion("util")}
          disabled={enviandoReaccion}
          aria-label="Marcar como útil"
          className={`disabled:opacity-60 transition-transform active:scale-90 px-3 py-1.5 rounded-lg text-xs font-semibold border ${reaccionUsuario === "util"
              ? "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
        >
          👍 Útil {contadorUtil > 0 && `(${contadorUtil})`}
        </button>

        <button
          type="button"
          onClick={() => manejarReaccion("alerta")}
          disabled={enviandoReaccion}
          aria-label="Marcar como alerta"
          className={`disabled:opacity-60 transition-transform active:scale-90 px-3 py-1.5 rounded-lg text-xs font-semibold border ${reaccionUsuario === "alerta"
              ? "border-red-500 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
        >
          🚨 Alerta {contadorAlerta > 0 && `(${contadorAlerta})`}
        </button>

        <button
          type="button"
          onClick={() => manejarReaccion("confirmo")}
          disabled={enviandoReaccion}
          aria-label="Confirmar situación"
          className={`disabled:opacity-60 transition-transform active:scale-90 px-3 py-1.5 rounded-lg text-xs font-semibold border ${reaccionUsuario === "confirmo"
              ? "border-blue-500 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
        >
          ✅ Confirmo {contadorConfirmo > 0 && `(${contadorConfirmo})`}
        </button>

        <button
          type="button"
          onClick={() => compartir(reporte)}
          aria-label="Compartir reporte"
          className="ml-auto transition-transform active:scale-90 text-gray-500 dark:text-gray-400"
        >
          <Icon name="bi-send" aria-hidden="true" className="text-xl -rotate-12" />
        </button>
      </div>

      <div className="px-4 pt-2 pb-4">
        {reporte.foto_url && (
          <p className="text-sm mt-1">
            <span className="font-semibold">{reporte.usuario_nombre}</span> {reporte.descripcion}
          </p>
        )}
      </div>
    </article>
  );
}

export default ReportCard;