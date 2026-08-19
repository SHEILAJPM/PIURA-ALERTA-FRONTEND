import { useState } from "react";
import { useAlbergues } from "../../hooks/useAlbergues";
import { actualizarOcupacionAlbergue } from "../../lib/api";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import Skeleton from "../../components/Skeleton";
import ErrorBanner from "../../components/ErrorBanner";

function nivelOcupacion(ocupacion, capacidad) {
  const pct = capacidad > 0 ? (ocupacion / capacidad) * 100 : 0;
  if (pct >= 90) return { texto: "Crítico", color: "var(--color-alerta)", bg: "var(--color-alerta-soft)" };
  if (pct >= 60)
    return { texto: "Casi lleno", color: "var(--color-prealerta)", bg: "var(--color-prealerta-soft)" };
  return { texto: "Disponible", color: "var(--color-normal)", bg: "var(--color-normal-soft)" };
}

function FilaAlbergue({ albergue, onGuardar }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(albergue.ocupacion_actual);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const nivel = nivelOcupacion(albergue.ocupacion_actual, albergue.capacidad);
  const pct = Math.min(100, Math.round((albergue.ocupacion_actual / albergue.capacidad) * 100));

  async function guardar() {
    const nueva = Number(valor);
    if (!Number.isFinite(nueva) || nueva < 0 || nueva > albergue.capacidad) {
      setError(`Debe ser un número entre 0 y ${albergue.capacidad}`);
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(albergue.id, nueva);
      setEditando(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  function cancelar() {
    setEditando(false);
    setValor(albergue.ocupacion_actual);
    setError(null);
  }

  return (
    <tr className="border-t align-top" style={{ borderColor: "var(--color-border)" }}>
      <td className="py-3 pl-5 pr-4">
        <p className="font-semibold">{albergue.nombre}</p>
        {albergue.direccion && (
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {albergue.direccion}
          </p>
        )}
      </td>
      <td className="py-3 pr-4 w-56">
        <div
          className="h-2 rounded-full overflow-hidden mb-1.5"
          style={{ backgroundColor: "var(--color-surface-alt)" }}
        >
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: nivel.color }} />
        </div>
        <p className="text-xs font-mono-data" style={{ color: "var(--color-text-muted)" }}>
          {albergue.ocupacion_actual} / {albergue.capacidad}
        </p>
      </td>
      <td className="py-3 pr-4">
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ color: nivel.color, backgroundColor: nivel.bg }}
        >
          {nivel.texto}
        </span>
      </td>
      <td className="py-3 pr-5 text-right">
        {editando ? (
          <div className="flex items-center justify-end gap-2">
            <input
              type="number"
              min="0"
              max={albergue.capacidad}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              aria-label={`Nueva ocupación de ${albergue.nombre}`}
              className="w-20 rounded-lg border px-2 py-1 text-sm font-mono-data text-right"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text)",
              }}
            />
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {guardando ? "..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={cancelar}
              className="text-xs font-medium"
              style={{ color: "var(--color-text-muted)" }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="text-xs font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            Editar aforo
          </button>
        )}
        {error && (
          <p className="text-xs mt-1" style={{ color: "var(--color-alerta)" }}>
            {error}
          </p>
        )}
      </td>
    </tr>
  );
}

function Albergues() {
  const { data: albergues, loading, error, setData, recargar } = useAlbergues();

  async function guardarOcupacion(id, ocupacionActual) {
    const actualizado = await actualizarOcupacionAlbergue(id, ocupacionActual);
    setData((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ocupacion_actual: actualizado.ocupacion_actual } : a))
    );
  }

  return (
    <>
      <AdminPageHeader titulo="ALBERGUES" subtitulo="INVENTARIO Y AFORO" />

      <div className="p-4 sm:p-8">
        {error && (
          <div className="mb-6">
            <ErrorBanner message={`No se pudieron cargar los albergues: ${error}`} onRetry={recargar} />
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : !albergues || albergues.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>No hay albergues registrados.</p>
        ) : (
          <div
            className="rounded-2xl border overflow-x-auto"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left text-xs uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <th className="pl-5 pr-4 py-3 font-semibold">Albergue</th>
                  <th className="pr-4 py-3 font-semibold">Ocupación</th>
                  <th className="pr-4 py-3 font-semibold">Estado</th>
                  <th className="pr-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {albergues.map((a) => (
                  <FilaAlbergue key={a.id} albergue={a} onGuardar={guardarOcupacion} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default Albergues;
