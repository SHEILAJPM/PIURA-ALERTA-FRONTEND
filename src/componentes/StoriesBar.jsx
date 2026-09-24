import { useState } from "react";
import { useResource } from "../ganchos/useResource";
import { getReportes } from "../utilidades/api";
import Skeleton from "./Skeleton";
import HistoriaModal from "./HistoriaModal";

const VEINTICUATRO_HORAS_MS = 24 * 60 * 60 * 1000;

function esReciente(reporte) {
  return Date.now() - new Date(reporte.creado_en).getTime() < VEINTICUATRO_HORAS_MS;
}

// "Historias": los reportes con foto de las últimas 24h, mostrados como
// círculos igual que un feed de historias — pasado ese tiempo dejan de
// aparecer acá (el reporte en sí sigue en el feed normal de abajo).
function StoriesBar() {
  const { data, loading } = useResource(() => getReportes({ conFoto: true, limite: 15 }), []);
  const [indiceAbierto, setIndiceAbierto] = useState(null);
  const historias = (data ?? []).filter(esReciente);

  if (loading) {
    return (
      <div className="flex gap-4 mb-4 overflow-x-auto pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="w-15 h-15 rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  if (historias.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 mb-4 overflow-x-auto pb-1 px-0.5">
        {historias.map((historia, i) => (
          <button
            key={historia.id}
            type="button"
            onClick={() => setIndiceAbierto(i)}
            className="flex flex-col items-center gap-1.5 shrink-0 w-16 group"
            title={historia.descripcion}
          >
            <span
              className="w-15 h-15 rounded-full p-[2.5px] transition-transform group-hover:scale-105"
              style={{
                background:
                  "conic-gradient(from -45deg, #fed373 0deg, #f15245 90deg, #d92e7f 150deg, #9b36b7 210deg, #515bd4 270deg, #fed373 360deg)",
              }}
            >
              <span
                className="block w-full h-full rounded-full p-[2.5px]"
                style={{ backgroundColor: "var(--color-bg)" }}
              >
                <img
                  src={historia.foto_url}
                  alt={historia.descripcion}
                  loading="lazy"
                  className="w-full h-full rounded-full object-cover"
                />
              </span>
            </span>
            <span
              className="text-xs truncate w-full text-center"
              style={{ color: "var(--color-text-muted)" }}
            >
              {historia.usuario_nombre}
            </span>
          </button>
        ))}
      </div>

      {indiceAbierto !== null && (
        <HistoriaModal
          historias={historias}
          indiceInicial={indiceAbierto}
          onCerrar={() => setIndiceAbierto(null)}
        />
      )}
    </>
  );
}

export default StoriesBar;
