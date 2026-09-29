import { useState } from "react";
import { subirFoto } from "../utilidades/cloudinary";
import Icon from "./Icon";

const inputStyle = {
  borderColor: "var(--color-border)",
  backgroundColor: "var(--color-bg)",
  color: "var(--color-text)",
};

const MAX_FOTOS = 6;

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function ReclamoSeguroForm({ onEnviar }) {
  const [fechaDano, setFechaDano] = useState(hoyISO());
  const [descripcion, setDescripcion] = useState("");
  const [fotos, setFotos] = useState([]); // [{ url, previsualizacion, subiendo }]
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const subiendoAlguna = fotos.some((f) => f.subiendo);

  async function manejarSeleccionFotos(e) {
    const archivos = Array.from(e.target.files ?? []).slice(0, MAX_FOTOS - fotos.length);
    e.target.value = "";
    if (archivos.length === 0) return;

    const nuevas = archivos.map((archivo) => ({
      previsualizacion: URL.createObjectURL(archivo),
      url: null,
      subiendo: true,
    }));
    setFotos((prev) => [...prev, ...nuevas]);

    await Promise.all(
      archivos.map(async (archivo, i) => {
        const objetivo = nuevas[i];
        try {
          const url = await subirFoto(archivo);
          setFotos((prev) => prev.map((f) => (f === objetivo ? { ...f, url, subiendo: false } : f)));
        } catch {
          setFotos((prev) => prev.filter((f) => f !== objetivo));
          setError("No se pudo subir una de las fotos, intenta de nuevo.");
        }
      })
    );
  }

  function quitarFoto(index) {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    if (!descripcion.trim()) {
      setError("Cuenta brevemente qué daño sufriste.");
      return;
    }
    const urls = fotos.filter((f) => f.url).map((f) => f.url);
    if (urls.length === 0) {
      setError("Adjunta al menos una foto del daño.");
      return;
    }
    if (subiendoAlguna) {
      setError("Espera a que terminen de subir las fotos.");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await onEnviar({ fecha_dano: fechaDano, descripcion: descripcion.trim(), foto_urls: urls });
      setDescripcion("");
      setFotos([]);
      setFechaDano(hoyISO());
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={manejarSubmit}
      className="rounded-2xl border p-5 space-y-3"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <h3 className="font-bold">Reportar un daño</h3>
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        Cuéntanos qué pasó y adjunta fotos. Un administrador revisa cada caso y define el monto a reconocer
        dentro del tope de tu plan.
      </p>

      <div>
        <label
          htmlFor="reclamo-fecha"
          className="text-xs font-semibold"
          style={{ color: "var(--color-text-muted)" }}
        >
          Fecha del daño
        </label>
        <input
          id="reclamo-fecha"
          type="date"
          value={fechaDano}
          max={hoyISO()}
          onChange={(e) => setFechaDano(e.target.value)}
          required
          className="w-full mt-1 rounded-lg border px-3 py-2 text-sm font-mono-data"
          style={inputStyle}
        />
      </div>

      <textarea
        placeholder="¿Qué se dañó y cómo pasó? (obligatorio)"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        rows={3}
        maxLength={2000}
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={inputStyle}
      />

      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((f, i) => (
            <div key={i} className="relative">
              <img src={f.previsualizacion} alt="" className="w-full h-20 object-cover rounded-lg" />
              {f.subiendo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg text-white text-xs">
                  Subiendo...
                </div>
              )}
              {!f.subiendo && (
                <button
                  type="button"
                  onClick={() => quitarFoto(i)}
                  aria-label="Quitar foto"
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
                >
                  <Icon name="bi-x-lg" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {fotos.length < MAX_FOTOS && (
        <label
          className="text-sm font-semibold cursor-pointer flex items-center gap-1.5 w-fit"
          style={{ color: "var(--color-primary)" }}
        >
          <Icon name="bi-camera" aria-hidden="true" /> {fotos.length ? "Agregar más fotos" : "Adjuntar fotos"}
          <input type="file" accept="image/*" multiple onChange={manejarSeleccionFotos} className="hidden" />
        </label>
      )}

      {error && (
        <p className="text-sm" style={{ color: "var(--color-alerta)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || subiendoAlguna}
        className="w-full rounded-lg py-2.5 font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {enviando ? "Enviando..." : "Enviar reclamo"}
      </button>
    </form>
  );
}

export default ReclamoSeguroForm;
