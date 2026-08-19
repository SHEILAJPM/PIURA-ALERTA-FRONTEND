import { useState } from "react";
import { useSensores } from "../../hooks/useSensores";
import { crearSensor } from "../../lib/api";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import Skeleton from "../../components/Skeleton";
import ErrorBanner from "../../components/ErrorBanner";
import Icon from "../../components/Icon";

const CAMPOS_INICIALES = {
  codigo: "",
  nombre: "",
  lon: "",
  lat: "",
  nivel_prealerta_cm: "",
  nivel_alerta_roja_cm: "",
};

function coordenadas(ubicacionGeoJSON) {
  const [lon, lat] = ubicacionGeoJSON?.coordinates ?? [null, null];
  if (lon == null || lat == null) return "—";
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

function NuevoNodo({ onCrear }) {
  const [abierto, setAbierto] = useState(false);
  const [campos, setCampos] = useState(CAMPOS_INICIALES);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  function actualizar(campo) {
    return (e) => setCampos((prev) => ({ ...prev, [campo]: e.target.value }));
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    const datos = {
      codigo: campos.codigo.trim(),
      nombre: campos.nombre.trim(),
      lon: Number(campos.lon),
      lat: Number(campos.lat),
      nivel_prealerta_cm: Number(campos.nivel_prealerta_cm),
      nivel_alerta_roja_cm: Number(campos.nivel_alerta_roja_cm),
    };
    if (Object.values(datos).some((v) => v === "" || (typeof v === "number" && Number.isNaN(v)))) {
      setError("Completa todos los campos");
      return;
    }
    if (datos.nivel_alerta_roja_cm <= datos.nivel_prealerta_cm) {
      setError("El umbral de alerta roja debe ser mayor que el de prealerta");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await onCrear(datos);
      setCampos(CAMPOS_INICIALES);
      setAbierto(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const inputStyle = {
    borderColor: "var(--color-border)",
    backgroundColor: "var(--color-bg)",
    color: "var(--color-text)",
  };

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg text-white"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <Icon name="bi-plus-lg" aria-hidden="true" /> Registrar nodo ESP32
      </button>
    );
  }

  return (
    <form
      onSubmit={manejarSubmit}
      className="rounded-2xl border p-5 mb-6"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="sensor-codigo"
            className="text-xs font-semibold"
            style={{ color: "var(--color-text-muted)" }}
          >
            Código del ESP32
          </label>
          <input
            id="sensor-codigo"
            type="text"
            placeholder="RIO-PIURA-02"
            value={campos.codigo}
            onChange={actualizar("codigo")}
            maxLength={50}
            required
            className="w-full mt-1 rounded-lg border px-3 py-2 text-sm font-mono-data"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            htmlFor="sensor-nombre"
            className="text-xs font-semibold"
            style={{ color: "var(--color-text-muted)" }}
          >
            Nombre / ubicación
          </label>
          <input
            id="sensor-nombre"
            type="text"
            placeholder="Puente Bolognesi"
            value={campos.nombre}
            onChange={actualizar("nombre")}
            maxLength={150}
            required
            className="w-full mt-1 rounded-lg border px-3 py-2 text-sm"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            htmlFor="sensor-lat"
            className="text-xs font-semibold"
            style={{ color: "var(--color-text-muted)" }}
          >
            Latitud
          </label>
          <input
            id="sensor-lat"
            type="number"
            step="any"
            placeholder="-5.1945"
            value={campos.lat}
            onChange={actualizar("lat")}
            required
            className="w-full mt-1 rounded-lg border px-3 py-2 text-sm font-mono-data"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            htmlFor="sensor-lon"
            className="text-xs font-semibold"
            style={{ color: "var(--color-text-muted)" }}
          >
            Longitud
          </label>
          <input
            id="sensor-lon"
            type="number"
            step="any"
            placeholder="-80.6328"
            value={campos.lon}
            onChange={actualizar("lon")}
            required
            className="w-full mt-1 rounded-lg border px-3 py-2 text-sm font-mono-data"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            htmlFor="sensor-prealerta"
            className="text-xs font-semibold"
            style={{ color: "var(--color-prealerta)" }}
          >
            Umbral prealerta (cm)
          </label>
          <input
            id="sensor-prealerta"
            type="number"
            step="0.1"
            min="0"
            placeholder="10"
            value={campos.nivel_prealerta_cm}
            onChange={actualizar("nivel_prealerta_cm")}
            required
            className="w-full mt-1 rounded-lg border px-3 py-2 text-sm font-mono-data"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            htmlFor="sensor-alerta-roja"
            className="text-xs font-semibold"
            style={{ color: "var(--color-alerta)" }}
          >
            Umbral alerta roja (cm)
          </label>
          <input
            id="sensor-alerta-roja"
            type="number"
            step="0.1"
            min="0"
            placeholder="16"
            value={campos.nivel_alerta_roja_cm}
            onChange={actualizar("nivel_alerta_roja_cm")}
            required
            className="w-full mt-1 rounded-lg border px-3 py-2 text-sm font-mono-data"
            style={inputStyle}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm mt-3" style={{ color: "var(--color-alerta)" }}>
          {error}
        </p>
      )}

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={enviando}
          className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {enviando ? "Registrando..." : "Registrar nodo"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="text-sm font-medium px-4 py-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function CatalogoNodos() {
  const { data: sensores, loading, error, setData, recargar } = useSensores();

  async function manejarCrear(datos) {
    const nuevo = await crearSensor(datos);
    setData((prev) => [...(prev ?? []), nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)));
  }

  return (
    <>
      <AdminPageHeader titulo="CATÁLOGO DE NODOS" subtitulo="ESP32 · COORDENADAS GPS" />

      <div className="p-4 sm:p-8">
        {error && (
          <div className="mb-6">
            <ErrorBanner message={`No se pudo cargar el catálogo: ${error}`} onRetry={recargar} />
          </div>
        )}

        <NuevoNodo onCrear={manejarCrear} />

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : !sensores || sensores.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>No hay nodos registrados todavía.</p>
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
                  <th className="pl-5 pr-4 py-3 font-semibold">Código</th>
                  <th className="pr-4 py-3 font-semibold">Nombre</th>
                  <th className="pr-4 py-3 font-semibold">Coordenadas GPS</th>
                  <th className="pr-5 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {sensores.map((s) => (
                  <tr key={s.id} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                    <td className="pl-5 pr-4 py-3 font-mono-data">{s.codigo}</td>
                    <td className="pr-4 py-3">{s.nombre}</td>
                    <td
                      className="pr-4 py-3 font-mono-data text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {coordenadas(s.ubicacion)}
                    </td>
                    <td className="pr-5 py-3">
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={
                          s.activo
                            ? { color: "var(--color-normal)", backgroundColor: "var(--color-normal-soft)" }
                            : {
                                color: "var(--color-text-muted)",
                                backgroundColor: "var(--color-surface-alt)",
                              }
                        }
                      >
                        {s.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs mt-4" style={{ color: "var(--color-text-muted)" }}>
          Un nodo recién registrado empieza a aparecer en Telemetría en cuanto el ESP32 envíe su primera
          lectura con este mismo código. Desactivar un nodo todavía requiere acceso directo a la base de
          datos.
        </p>
      </div>
    </>
  );
}

export default CatalogoNodos;
