import { useEffect, useState } from "react";
import { useAuth } from "../contexto/AuthContext";
import { getMiChequeo, marcarSeguro } from "../utilidades/api";
import Icon from "./Icon";

function formatearRelativo(iso) {
  const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return "hace un momento";
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Solo tiene sentido para un ciudadano con cuenta (ver GET /api/chequeos-seguridad
// en el backend, que solo rastrea usuarios) -- no aparece para visitantes anónimos.
function ChequeoSeguridad() {
  const { usuario } = useAuth();
  const [ultimoChequeo, setUltimoChequeo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!usuario) return;
    let activo = true;
    getMiChequeo()
      .then((data) => activo && setUltimoChequeo(data.ultimoChequeo))
      .catch(() => {})
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [usuario]);

  if (!usuario) return null;

  async function manejarClick() {
    setEnviando(true);
    setError(null);
    try {
      const resultado = await marcarSeguro();
      setUltimoChequeo(resultado.creado_en);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section
      className="mt-8 rounded-3xl border p-6 flex flex-wrap items-center justify-between gap-4"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Icon name="bi-check-circle-fill" aria-hidden="true" style={{ color: "var(--color-primary)" }} />
          Estoy a salvo
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          {cargando
            ? "Cargando..."
            : ultimoChequeo
              ? `Último aviso: ${formatearRelativo(ultimoChequeo)}`
              : "Avísale a Defensa Civil que estás bien durante una emergencia."}
        </p>
        {error && (
          <p className="text-sm mt-1" style={{ color: "var(--color-alerta)" }}>
            {error}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={manejarClick}
        disabled={enviando || cargando}
        className="shrink-0 font-semibold text-sm text-white px-5 py-2.5 rounded-xl disabled:opacity-60"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {enviando ? "Enviando..." : "Marcar que estoy a salvo"}
      </button>
    </section>
  );
}

export default ChequeoSeguridad;
