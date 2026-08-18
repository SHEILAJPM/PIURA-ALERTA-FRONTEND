import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ESTADO_LABEL = {
  pendiente: { text: "Pendiente de revisión", color: "var(--color-prealerta)", bg: "var(--color-prealerta-soft)" },
  verificado: { text: "Verificado", color: "var(--color-normal)", bg: "var(--color-normal-soft)" },
  descartado: { text: "Descartado", color: "var(--color-text-muted)", bg: "var(--color-surface-alt)" },
};

function formatearFecha(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReportCard({ reporte, onLike }) {
  const { usuario, abrirModal } = useAuth();
  const [enviandoLike, setEnviandoLike] = useState(false);
  const estado = ESTADO_LABEL[reporte.estado] ?? ESTADO_LABEL.pendiente;

  async function manejarLike() {
    if (!usuario) {
      abrirModal("login");
      return;
    }
    if (enviandoLike) return;
    setEnviandoLike(true);
    try {
      await onLike(reporte.id);
    } finally {
      setEnviandoLike(false);
    }
  }

  return (
    <article
      className="rounded-2xl border p-5"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{reporte.usuario_nombre}</p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {formatearFecha(reporte.creado_en)}
          </p>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full shrink-0"
          style={{ color: estado.color, backgroundColor: estado.bg }}
        >
          {estado.text}
        </span>
      </div>

      <p className="mt-3 text-sm" style={{ color: "var(--color-text)" }}>
        {reporte.descripcion}
      </p>

      {reporte.foto_url && (
        <img
          src={reporte.foto_url}
          alt="Foto del reporte"
          className="mt-3 rounded-xl max-h-64 w-full object-cover"
        />
      )}

      <div className="mt-3 flex items-center gap-1.5 text-sm">
        <button
          type="button"
          onClick={manejarLike}
          disabled={enviandoLike}
          aria-label={reporte.te_gusta ? "Quitar me gusta" : "Dar me gusta"}
          className="flex items-center gap-1.5 disabled:opacity-60"
          style={{ color: reporte.te_gusta ? "var(--color-alerta)" : "var(--color-text-muted)" }}
        >
          <i className={`bi ${reporte.te_gusta ? "bi-heart-fill" : "bi-heart"}`} aria-hidden="true" />{" "}
          {reporte.likes_count}
        </button>
      </div>
    </article>
  );
}

export default ReportCard;
