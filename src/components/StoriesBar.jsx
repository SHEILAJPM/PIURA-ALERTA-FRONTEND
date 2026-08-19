import { useResource } from "../hooks/useResource";
import { getReportes } from "../lib/api";
import Skeleton from "./Skeleton";

// "Historias": no es una entidad separada ni expira a las 24h -- son
// simplemente los últimos reportes que tienen foto, mostrados como círculos.
// Mismo dato del feed, presentación distinta.
function StoriesBar() {
  const { data: historias, loading } = useResource(() => getReportes({ conFoto: true, limite: 15 }), []);

  if (loading) {
    return (
      <div className="flex gap-4 mb-4 overflow-x-auto pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="w-15 h-15 rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  if (!historias || historias.length === 0) return null;

  return (
    <div className="flex gap-4 mb-4 overflow-x-auto pb-1 px-0.5">
      {historias.map((historia) => (
        <a
          key={historia.id}
          href={historia.foto_url}
          target="_blank"
          rel="noreferrer"
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
          <span className="text-xs truncate w-full text-center" style={{ color: "var(--color-text-muted)" }}>
            {historia.usuario_nombre}
          </span>
        </a>
      ))}
    </div>
  );
}

export default StoriesBar;
