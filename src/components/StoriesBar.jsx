import React from "react";
import { useResource } from "../hooks/useResource";
import { getReportes } from "../lib/api";
import Skeleton from "./Skeleton";

// "Historias": no es una entidad separada ni expira a las 24h -- son
// simplemente los últimos reportes que tienen foto, mostrados como círculos.
// Mismo dato del feed, presentación distinta.
function StoriesBar() {
  const { data: historias, loading } = useResource(
    () => getReportes({ conFoto: true, limite: 15 }),
    []
  );

  if (loading) {
    return (
      <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="w-16 h-16 rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  if (!historias || historias.length === 0) return null;

  return (
    <div className="flex gap-4 mb-6 overflow-x-auto pb-1">
      {historias.map((historia) => (
        <a
          key={historia.id}
          href={historia.foto_url}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1 shrink-0 w-16"
          title={historia.descripcion}
        >
          <span
            className="w-16 h-16 rounded-full p-0.5"
            style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-prealerta))" }}
          >
            <img
              src={historia.foto_url}
              alt={historia.descripcion}
              className="w-full h-full rounded-full object-cover border-2"
              style={{ borderColor: "var(--color-surface)" }}
            />
          </span>
          <span
            className="text-xs truncate w-full text-center"
            style={{ color: "var(--color-text-muted)" }}
          >
            {historia.usuario_nombre}
          </span>
        </a>
      ))}
    </div>
  );
}

export default StoriesBar;
