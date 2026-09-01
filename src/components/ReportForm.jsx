import { useState, useEffect } from "react";
import { subirFoto } from "../lib/cloudinary";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import Icon from "./Icon";

const inputStyle = {
  borderColor: "var(--color-border)",
  backgroundColor: "var(--color-bg)",
  color: "var(--color-text)",
};

function ReportForm({ onEnviar, enviando }) {
  const { usuario } = useAuth();
  const [autorNombre, setAutorNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState(null); // { url, previsualizacion }
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [ubicacion, setUbicacion] = useState(null);
  const [errorLocal, setErrorLocal] = useState(null);
  const [avisoEncolado, setAvisoEncolado] = useState(false);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    setObteniendoUbicacion(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({
          lon: pos.coords.longitude,
          lat: pos.coords.latitude,
        });
        setObteniendoUbicacion(false);
        setErrorLocal(null);
      },
      (err) => {
        // Silencioso si el usuario deniega o hay error
        setObteniendoUbicacion(false);
        // Solo mostramos error si el usuario lo pide explícitamente
        if (err.code === err.PERMISSION_DENIED) {
          // No mostramos error automático, solo guardamos que no hay ubicación
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minuto de caché
      }
    );
  }, []); 

  function obtenerUbicacionManual() {
    if (!navigator.geolocation) {
      setErrorLocal("Tu navegador no soporta geolocalización.");
      return;
    }
    setObteniendoUbicacion(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({ lon: pos.coords.longitude, lat: pos.coords.latitude });
        setObteniendoUbicacion(false);
        setErrorLocal(null);
      },
      () => {
        setObteniendoUbicacion(false);
        setErrorLocal("No se pudo obtener tu ubicación. Puedes intentar de nuevo.");
      }
    );
  }

  async function manejarSeleccionFoto(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    // Validar tamaño (máximo 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      setErrorLocal("La imagen es demasiado grande. Máximo 5MB.");
      return;
    }

    const previsualizacion = URL.createObjectURL(archivo);
    setFoto({ url: null, previsualizacion });
    setSubiendoFoto(true);
    setErrorLocal(null);

    try {
      const url = await subirFoto(archivo);
      setFoto({ url, previsualizacion });
    } catch (err) {
      setErrorLocal(err.message);
      setFoto(null);
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    if (!descripcion.trim()) {
      setErrorLocal("Describe brevemente lo que estás reportando.");
      return;
    }
    if (subiendoFoto) {
      setErrorLocal("Espera a que termine de subir la foto.");
      return;
    }
    try {
      const resultado = await onEnviar({
        autor_nombre: usuario ? undefined : autorNombre.trim() || undefined,
        descripcion: descripcion.trim(),
        foto_url: foto?.url ?? undefined,
        ...(ubicacion ?? {}),
      });
      setAutorNombre("");
      setDescripcion("");
      setFoto(null);
      setUbicacion(null);
      setErrorLocal(null);
      setAvisoEncolado(resultado?.encolado === true);
    } catch (err) {
      setErrorLocal(err.message);
    }
  }

  function formatearUbicacion() {
    if (!ubicacion) return null;
    return `${ubicacion.lat.toFixed(5)}, ${ubicacion.lon.toFixed(5)}`;
  }

  return (
    <form
      onSubmit={manejarSubmit}
      className="rounded-2xl border p-5 space-y-3 h-fit"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <h3 className="font-bold">Reportar una situación</h3>

      {usuario ? (
        <div className="flex items-center gap-2">
          <Avatar nombre={usuario.nombre} size={28} />
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Publicando como <strong style={{ color: "var(--color-text)" }}>{usuario.nombre}</strong>
          </p>
        </div>
      ) : (
        <input
          type="text"
          placeholder="Tu nombre (opcional)"
          value={autorNombre}
          onChange={(e) => setAutorNombre(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          style={inputStyle}
        />
      )}

      <textarea
        placeholder="¿Qué está pasando? (obligatorio)"
        value={descripcion}
        onChange={(e) => {
          setDescripcion(e.target.value);
          setAvisoEncolado(false);
        }}
        rows={3}
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={inputStyle}
      />

      {foto?.previsualizacion && (
        <div className="relative">
          <img
            src={foto.previsualizacion}
            alt="Previsualización"
            className="w-full max-h-48 object-cover rounded-lg"
          />
          {subiendoFoto && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg text-white text-sm">
              Subiendo foto...
            </div>
          )}
        </div>
      )}

      <label
        className="text-sm font-semibold cursor-pointer flex items-center gap-1.5"
        style={{ color: "var(--color-primary)" }}
      >
        <Icon name="bi-camera" aria-hidden="true" /> {foto ? "Cambiar foto" : "Adjuntar foto (opcional)"}
        <input type="file" accept="image/*" onChange={manejarSeleccionFoto} className="hidden" />
      </label>

      {/* 🔥 NUEVO: Botón de ubicación con estado mejorado */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={obtenerUbicacionManual}
          className="flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: "var(--color-primary)" }}
          disabled={obteniendoUbicacion}
        >
          <Icon
            name={ubicacion ? "bi-geo-alt-fill" : "bi-geo-alt"}
            aria-hidden="true"
          />
          {obteniendoUbicacion ? "Obteniendo ubicación..." : ubicacion ? "Actualizar ubicación" : "Compartir mi ubicación"}
        </button>
        {ubicacion && (
          <span className="text-xs font-mono-data" style={{ color: "var(--color-text-muted)" }}>
            📍 {formatearUbicacion()}
          </span>
        )}
        {obteniendoUbicacion && (
          <span className="text-xs animate-pulse" style={{ color: "var(--color-prealerta)" }}>
            Buscando GPS...
          </span>
        )}
      </div>

      {avisoEncolado && (
        <p
          className="text-sm rounded-lg px-3 py-2 flex items-start gap-2"
          style={{ backgroundColor: "var(--color-prealerta-soft)", color: "var(--color-prealerta)" }}
        >
          <Icon name="bi-exclamation-triangle-fill" aria-hidden="true" />
          Sin conexión: tu reporte quedó guardado y se enviará solo apenas vuelva internet.
        </p>
      )}

      {errorLocal && (
        <p className="text-sm" style={{ color: "var(--color-alerta)" }}>
          {errorLocal}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || subiendoFoto}
        className="w-full rounded-lg py-2.5 font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {enviando ? "Enviando..." : "Enviar reporte"}
      </button>
    </form>
  );
}

export default ReportForm;